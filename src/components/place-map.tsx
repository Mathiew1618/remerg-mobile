'use dom';

/**
 * The in-app map: bird's-eye view of a place, the route to it, and a 3D view.
 *
 * A DOM component, so the same CesiumJS globe runs on web directly and inside
 * a WebView on iOS and Android. Cesium is loaded from its CDN at runtime
 * rather than bundled: it is ~4MB of scripts plus workers and assets that
 * expect to be served from one base URL, and the map needs the network for
 * tiles anyway.
 *
 * Borrowed from the Colorado Prevention Map (the gods-eye-view lineage):
 *
 *   - Render on demand (requestRenderMode): the globe draws only when
 *     something changes, so an idle map costs a phone almost nothing.
 *   - The 3D view is a spotlight. Google's photorealistic mesh loads only
 *     inside a small circle around the place; the globe gets a matching hole
 *     (clipping PLANES, since clipping polygons crash Cesium's terrain fill);
 *     and one screen pass dims everything outside, so the building is lit and
 *     its surroundings sit in shadow.
 *
 * Props arrive asynchronously over the DOM bridge, so everything is driven by
 * effects on them rather than by imperative calls.
 */

import { useEffect, useRef, useState } from 'react';
import type { DOMProps } from 'expo/dom';

type LatLng = { lat: number; lng: number };

type Props = {
  dest: LatLng & { name: string };
  origin?: LatLng | null;
  /** [lng, lat] pairs. */
  route?: [number, number][] | null;
  show3D?: boolean;
  ionToken?: string | null;
  height: number;
  /** Tells the screen when 3D is unavailable or has loaded. */
  onStatus?: (status: 'ready' | '3d-ready' | '3d-unavailable' | 'error', detail?: string) => Promise<void>;
  dom?: DOMProps;
};

const CESIUM_VERSION = '1.145.0';
const CESIUM_BASE = `https://cdn.jsdelivr.net/npm/cesium@${CESIUM_VERSION}/Build/Cesium/`;
const ION_WORLD_TERRAIN = 1;
const ION_GOOGLE_3D = 2275207;
const SPOT_RADIUS_M = 250;        // the lit, 3D circle around the place
const ROUTE_COLOR = '#2fa972';    // the app's accent green
const DEST_COLOR = '#dc3545';     // crisis red reads as "the place" on any imagery
const ORIGIN_COLOR = '#3b82f6';

declare global {
  interface Window {
    Cesium?: any;
    CESIUM_BASE_URL?: string;
    __cesiumLoading?: Promise<any>;
  }
}

function loadCesium(): Promise<any> {
  if (window.Cesium) return Promise.resolve(window.Cesium);
  if (window.__cesiumLoading) return window.__cesiumLoading;
  window.CESIUM_BASE_URL = CESIUM_BASE;
  window.__cesiumLoading = new Promise((resolve, reject) => {
    const css = document.createElement('link');
    css.rel = 'stylesheet';
    css.href = `${CESIUM_BASE}Widgets/widgets.css`;
    document.head.appendChild(css);
    const s = document.createElement('script');
    s.src = `${CESIUM_BASE}Cesium.js`;
    s.onload = () => resolve(window.Cesium);
    s.onerror = () => reject(new Error('Could not load the map engine'));
    document.head.appendChild(s);
  });
  return window.__cesiumLoading;
}

// Dims every pixel by its distance from the place along the ground. Depth
// gives each pixel's world position; height is projected out so a tall
// building at the rim is judged by its footprint. Markers drawn on top of
// everything sit at the near plane and are left alone.
const SPOT_FS = `
uniform sampler2D colorTexture;
uniform sampler2D depthTexture;
uniform vec3 u_center;
uniform vec3 u_up;
uniform float u_r0;
uniform float u_r1;
uniform float u_dim;
in vec2 v_textureCoordinates;
void main(){
  vec4 color=texture(colorTexture,v_textureCoordinates);
  float z=czm_unpackDepth(texture(depthTexture,v_textureCoordinates));
  float k=1.0;
  if(z<1.0){
    z=czm_reverseLogDepth(z);
    float ndcZ=(2.0*z-czm_depthRange.near-czm_depthRange.far)/(czm_depthRange.far-czm_depthRange.near);
    vec4 eye=czm_inverseProjection*vec4(v_textureCoordinates*2.0-1.0,ndcZ,1.0);
    eye/=eye.w;
    if(-eye.z<5.0){ out_FragColor=color; return; }
    vec3 v=(czm_inverseView*vec4(eye.xyz,1.0)).xyz-u_center;
    float d=length(v-dot(v,u_up)*u_up);
    k=smoothstep(u_r0,u_r1,d);
  }
  out_FragColor=vec4(color.rgb*(1.0-u_dim*k),color.a);
}`;

export default function PlaceMap({ dest, origin, route, show3D = false, ionToken, height, onStatus }: Props) {
  const el = useRef<HTMLDivElement>(null);
  const st = useRef<any>({}); // viewer + everything hung off it, across effects
  // A ref cannot re-run effects; this flips once the globe is up so the route
  // and 3D effects apply whatever props arrived while it was booting.
  const [ready, setReady] = useState(false);

  // ---- boot: viewer, imagery, the destination pin, first flight ----
  useEffect(() => {
    let dead = false;
    (async () => {
      try {
        const C = await loadCesium();
        if (dead || !el.current) return;
        if (ionToken) C.Ion.defaultAccessToken = ionToken;
        let terrainProvider = new C.EllipsoidTerrainProvider();
        if (ionToken) {
          try { terrainProvider = await C.CesiumTerrainProvider.fromIonAssetId(ION_WORLD_TERRAIN); } catch {}
        }
        if (dead || !el.current) return;
        const viewer = new C.Viewer(el.current, {
          terrainProvider, baseLayer: false, baseLayerPicker: false, geocoder: false, homeButton: false,
          sceneModePicker: false, navigationHelpButton: false, animation: false, timeline: false,
          fullscreenButton: false, infoBox: false, selectionIndicator: false,
          requestRenderMode: true, maximumRenderTimeChange: Infinity,
        });
        viewer.targetFrameRate = 30;
        viewer.scene.postProcessStages.fxaa.enabled = false;
        viewer.scene.globe.depthTestAgainstTerrain = true;
        const esri = (name: string) => new C.UrlTemplateImageryProvider({
          url: `https://services.arcgisonline.com/ArcGIS/rest/services/${name}/MapServer/tile/{z}/{y}/{x}`,
          tilingScheme: new C.WebMercatorTilingScheme(), maximumLevel: 19,
          credit: 'Powered by Esri — Source: Esri, Maxar, Earthstar Geographics, and the GIS User Community',
        });
        // Satellite with roads and place names on top: a bird's-eye view that
        // still reads as a map.
        viewer.imageryLayers.addImageryProvider(esri('World_Imagery'));
        viewer.imageryLayers.addImageryProvider(esri('Reference/World_Transportation'));
        viewer.imageryLayers.addImageryProvider(esri('Reference/World_Boundaries_and_Places'));

        const pin = (p: LatLng, color: string, text?: string) => viewer.entities.add({
          position: C.Cartesian3.fromDegrees(p.lng, p.lat),
          point: {
            pixelSize: 16, color: C.Color.fromCssColorString(color), outlineColor: C.Color.WHITE, outlineWidth: 3,
            heightReference: C.HeightReference.CLAMP_TO_GROUND, disableDepthTestDistance: Number.POSITIVE_INFINITY,
          },
          label: text ? {
            text, font: '600 14px system-ui, sans-serif', fillColor: C.Color.WHITE, showBackground: true,
            backgroundColor: C.Color.fromCssColorString('#032256').withAlpha(0.85), pixelOffset: new C.Cartesian2(0, -26),
            heightReference: C.HeightReference.CLAMP_TO_GROUND, disableDepthTestDistance: Number.POSITIVE_INFINITY,
          } : undefined,
        });
        st.current = { C, viewer, pin, destPin: pin(dest, DEST_COLOR, dest.name) };

        // Ground height at the place: aims the 3D camera and the globe hole.
        let g = 0;
        try {
          const [s] = await C.sampleTerrainMostDetailed(viewer.terrainProvider, [C.Cartographic.fromDegrees(dest.lng, dest.lat)]);
          if (Number.isFinite(s?.height)) g = s.height;
        } catch {}
        st.current.ground = g;
        if (dead) return;
        setReady(true);
        await onStatus?.('ready');
      } catch (e: any) {
        await onStatus?.('error', String(e?.message ?? e));
      }
    })();
    return () => {
      dead = true;
      try { st.current.viewer?.destroy(); } catch {}
      st.current = {};
    };
    // The place is fixed for the life of the screen.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Straight down over the route if there is one, else over the place.
  function flyTopDown() {
    const { C, viewer, ground = 0 } = st.current;
    if (!viewer) return;
    const down = { heading: 0, pitch: -Math.PI / 2, roll: 0 };
    if (route && route.length > 1) {
      const pts = route.map(([x, y]) => C.Cartesian3.fromDegrees(x, y, ground));
      const bs = C.BoundingSphere.fromPoints(pts);
      viewer.camera.flyToBoundingSphere(bs, { offset: new C.HeadingPitchRange(0, -Math.PI / 2, bs.radius * 2.6 + 400), duration: 1.6 });
    } else {
      viewer.camera.flyTo({ destination: C.Cartesian3.fromDegrees(dest.lng, dest.lat, ground + 1400), orientation: down, duration: 1.6 });
    }
    viewer.scene.requestRender();
  }

  // ---- the route line and the start pin ----
  useEffect(() => {
    const { C, viewer, pin } = st.current;
    if (!viewer) return;
    if (st.current.routeEnt) viewer.entities.remove(st.current.routeEnt);
    if (st.current.originPin) viewer.entities.remove(st.current.originPin);
    st.current.routeEnt = st.current.originPin = null;
    if (route && route.length > 1) {
      st.current.routeEnt = viewer.entities.add({
        polyline: {
          positions: C.Cartesian3.fromDegreesArray(route.flat()), width: 7, clampToGround: true,
          material: new C.PolylineOutlineMaterialProperty({
            color: C.Color.fromCssColorString(ROUTE_COLOR), outlineColor: C.Color.fromCssColorString('#032256'), outlineWidth: 2,
          }),
        },
      });
    }
    if (origin) st.current.originPin = pin(origin, ORIGIN_COLOR, 'You');
    if (!st.current.spot) flyTopDown();
    viewer.scene.requestRender();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ready, route, origin]);

  // ---- 3D: the spotlight on the place ----
  useEffect(() => {
    const { C, viewer } = st.current;
    if (!viewer) return;
    let dead = false;
    const off = () => {
      const s = st.current;
      if (s.spot) { viewer.scene.postProcessStages.remove(s.spot); s.spot = null; }
      if (s.ring) { viewer.entities.remove(s.ring); s.ring = null; }
      if (s.tiles) { s.tiles.show = false; s.tiles.clippingPolygons = undefined; }
      viewer.scene.globe.clippingPlanes = undefined;
      viewer.scene.requestRender();
    };
    if (!show3D) {
      const was = !!st.current.spot;
      off();
      if (was) flyTopDown();
      return;
    }
    (async () => {
      if (!ionToken) { await onStatus?.('3d-unavailable', 'No 3D key on this build'); return; }
      try {
        if (!st.current.tiles) {
          const t = await C.Cesium3DTileset.fromIonAssetId(ION_GOOGLE_3D);
          t.cacheBytes = 128 * 1024 * 1024;
          t.enableCollision = true;
          t.tileLoad.addEventListener(() => viewer.scene.requestRender());
          st.current.tiles = viewer.scene.primitives.add(t);
        }
        if (dead) return;
        const g = st.current.ground ?? 0;
        const R = SPOT_RADIUS_M;
        const ring = (r: number) => {
          const dLat = r / 111320, dLon = r / (111320 * Math.cos((dest.lat * Math.PI) / 180)), pts: number[] = [];
          for (let i = 0; i < 96; i++) { const a = (i / 96) * Math.PI * 2; pts.push(dest.lng + dLon * Math.cos(a), dest.lat + dLat * Math.sin(a)); }
          return C.Cartesian3.fromDegreesArray(pts);
        };
        const t = st.current.tiles;
        // inverse:true keeps what is INSIDE. Cesium's default clips the inside away.
        t.clippingPolygons = new C.ClippingPolygonCollection({ polygons: [new C.ClippingPolygon({ positions: ring(R) })], inverse: true });
        t.show = true;
        // Hole in the globe under the circle, so terrain cannot poke through
        // the mesh: a prism of inward-facing planes in the place's local frame.
        const planes = [];
        for (let i = 0; i < 48; i++) {
          const a = (i / 48) * Math.PI * 2;
          planes.push(new C.ClippingPlane(new C.Cartesian3(-Math.cos(a), -Math.sin(a), 0), R * 0.99));
        }
        viewer.scene.globe.clippingPlanes = new C.ClippingPlaneCollection({
          modelMatrix: C.Transforms.eastNorthUpToFixedFrame(C.Cartesian3.fromDegrees(dest.lng, dest.lat, g)),
          planes, unionClippingRegions: false, edgeWidth: 0,
        });
        const center = C.Cartesian3.fromDegrees(dest.lng, dest.lat, g);
        st.current.spot = viewer.scene.postProcessStages.add(new C.PostProcessStage({
          fragmentShader: SPOT_FS,
          uniforms: { u_center: center, u_up: C.Ellipsoid.WGS84.geodeticSurfaceNormal(center, new C.Cartesian3()), u_r0: R, u_r1: R * 1.25, u_dim: 0.6 },
        }));
        const rim = ring(R); rim.push(rim[0]);
        st.current.ring = viewer.entities.add({ polyline: {
          positions: rim, width: 6, clampToGround: true, classificationType: C.ClassificationType.BOTH,
          material: new C.PolylineGlowMaterialProperty({ glowPower: 0.22, color: C.Color.WHITE.withAlpha(0.95) }),
        } });
        viewer.camera.flyToBoundingSphere(new C.BoundingSphere(center, R), {
          offset: new C.HeadingPitchRange(0, C.Math.toRadians(-45), R * 3.4), duration: 1.8,
        });
        viewer.scene.requestRender();
        await onStatus?.('3d-ready');
      } catch (e: any) {
        off();
        await onStatus?.('3d-unavailable', String(e?.message ?? e));
      }
    })();
    return () => { dead = true; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ready, show3D]);

  return <div ref={el} style={{ width: '100%', height, borderRadius: 18, overflow: 'hidden', background: '#0a0f18' }} />;
}
