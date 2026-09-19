/**
 * Crisis hotlines — bundled, offline-first.
 *
 * Scraped from the Crisis Hotlines modal on remerg.com/resource-map/ and frozen
 * into the binary ON PURPOSE. This audience runs on prepaid phones, throttled
 * data and dead zones; a crisis number that needs a network round-trip to
 * appear is a crisis number that fails when it matters. `syncHotlines()` in
 * src/lib/remerg.ts can refresh these at runtime, but the app never *depends*
 * on that call succeeding.
 *
 * Verified against the live site: 2026-09-18.
 * Sorted by triage priority — 911 and 988 first.
 */

export type HotlineCategory =
  | 'emergency'
  | 'crisis'
  | 'safety'
  | 'recovery'
  | 'health'
  | 'basic-needs'
  | 'support';

/** '24/7' = always staffed. 'hours' = business hours. 'varies' = by region. */
export type Availability = '24/7' | 'hours' | 'varies';

export type HotlineNumber = {
  /** Region or sub-line, e.g. "Denver". Null when the org has one line. */
  label: string | null;
  number: string;
};

export type Hotline = {
  id: string;
  name: string;
  category: HotlineCategory;
  availability: Availability;
  /** Lower sorts first. 911 is 0. */
  priority: number;
  description: string | null;
  numbers: HotlineNumber[];
};

export const HOTLINES: Hotline[] = [
  {
    id: "emergency-medical-or-police",
    name: "Emergency (medical or police)",
    category: "emergency",
    availability: "24/7",
    priority: 0,
    description: null,
    numbers: [
      {
        label: "Phone:",
        number: "911"
      }
    ]
  },
  {
    id: "suicide-prevention-hotline",
    name: "Suicide Prevention Hotline",
    category: "crisis",
    availability: "24/7",
    priority: 1,
    description: null,
    numbers: [
      {
        label: "Phone:",
        number: "988"
      }
    ]
  },
  {
    id: "colorado-crisis-services",
    name: "Colorado Crisis Services",
    category: "crisis",
    availability: "24/7",
    priority: 2,
    description: "Text: TALK to 38255",
    numbers: [
      {
        label: "Phone:",
        number: "988"
      }
    ]
  },
  {
    id: "veterans-crisis-line",
    name: "Veterans Crisis Line",
    category: "crisis",
    availability: "24/7",
    priority: 3,
    description: null,
    numbers: [
      {
        label: "Phone:",
        number: "988, then press 1"
      }
    ]
  },
  {
    id: "trevor-project-lgbtq-crisis-hotline-for-youth",
    name: "Trevor Project, LGBTQ Crisis Hotline for Youth",
    category: "crisis",
    availability: "24/7",
    priority: 4,
    description: "Text: text START to 678-678",
    numbers: [
      {
        label: "Phone:",
        number: "866-488-7386"
      }
    ]
  },
  {
    id: "national-domestic-violence-hotline",
    name: "National Domestic Violence Hotline",
    category: "safety",
    availability: "24/7",
    priority: 5,
    description: null,
    numbers: [
      {
        label: "Phone:",
        number: "800-799-7233"
      }
    ]
  },
  {
    id: "disaster-distress-helpline-covid-counseling",
    name: "Disaster Distress Helpline \u2014 COVID Counseling",
    category: "crisis",
    availability: "24/7",
    priority: 6,
    description: null,
    numbers: [
      {
        label: "Phone:",
        number: "800-985-5990"
      }
    ]
  },
  {
    id: "substance-abuse-and-mental-health-services-admin",
    name: "Substance Abuse and Mental Health Services Administration (SAMSHA) helpline",
    category: "recovery",
    availability: "24/7",
    priority: 7,
    description: null,
    numbers: [
      {
        label: "Phone:",
        number: "800-662-4357"
      }
    ]
  },
  {
    id: "alcoholics-anonymous",
    name: "Alcoholics Anonymous",
    category: "recovery",
    availability: "varies",
    priority: 10,
    description: null,
    numbers: [
      {
        label: "Boulder",
        number: "303-447-8201"
      },
      {
        label: "Colorado Springs",
        number: "719-573-5020"
      },
      {
        label: "Denver",
        number: "303-322-4440"
      },
      {
        label: "Fort Collins",
        number: "970-224-3552"
      },
      {
        label: "Glenwood Springs",
        number: "970-245-9649"
      },
      {
        label: "Grand Junction",
        number: "888-333-9649"
      },
      {
        label: "Pueblo",
        number: "719-546-1173"
      }
    ]
  },
  {
    id: "narcotics-anonymous-colorado",
    name: "Narcotics Anonymous (Colorado)",
    category: "recovery",
    availability: "varies",
    priority: 11,
    description: null,
    numbers: [
      {
        label: "Boulder",
        number: "303-412-2884"
      },
      {
        label: "Denver",
        number: "303-832-3784"
      },
      {
        label: "Colorado Springs",
        number: "719-637-1580"
      },
      {
        label: "Mountains West Area",
        number: "970-306-6535"
      },
      {
        label: "Off the Wall",
        number: "970-282-8079"
      },
      {
        label: "Bringing Freedom East",
        number: "970-458-5081"
      }
    ]
  },
  {
    id: "cocaine-anonymous",
    name: "Cocaine Anonymous",
    category: "recovery",
    availability: "varies",
    priority: 12,
    description: null,
    numbers: [
      {
        label: "Phone:",
        number: "866-768-7709"
      }
    ]
  },
  {
    id: "crystal-meth-anonymous",
    name: "Crystal Meth Anonymous",
    category: "recovery",
    availability: "varies",
    priority: 13,
    description: null,
    numbers: [
      {
        label: "Phone:",
        number: "855-638-4373"
      },
      {
        label: "Denver",
        number: "720-295-4409"
      }
    ]
  },
  {
    id: "marijuana-anonymous-colorado",
    name: "Marijuana Anonymous (Colorado)",
    category: "recovery",
    availability: "varies",
    priority: 14,
    description: null,
    numbers: [
      {
        label: "Phone:",
        number: "303-607-7516"
      }
    ]
  },
  {
    id: "colorado-quitline",
    name: "Colorado Quitline",
    category: "health",
    availability: "hours",
    priority: 20,
    description: null,
    numbers: [
      {
        label: "Phone:",
        number: "800-784-8669"
      }
    ]
  },
  {
    id: "medicaid-nurse-advice-24-7-free-help-for-health-",
    name: "Medicaid Nurse Advice \u2014 24/7 free help for Health First Colorado Members",
    category: "health",
    availability: "24/7",
    priority: 21,
    description: null,
    numbers: [
      {
        label: "Phone:",
        number: "800-283-3221"
      }
    ]
  },
  {
    id: "food-resource-hotline-hunger-free-colorado",
    name: "Food Resource Hotline \u2014 Hunger Free Colorado",
    category: "basic-needs",
    availability: "hours",
    priority: 30,
    description: null,
    numbers: [
      {
        label: "Phone:",
        number: "855-855-4626"
      },
      {
        label: "Denver",
        number: "720-382-2920"
      }
    ]
  },
  {
    id: "united-way-s-resource-database",
    name: "United Way\u2019s Resource Database",
    category: "basic-needs",
    availability: "24/7",
    priority: 31,
    description: "Text: text your zip code to 898-211",
    numbers: [
      {
        label: "Phone:",
        number: "211"
      }
    ]
  },
  {
    id: "cwise",
    name: "CWISE",
    category: "support",
    availability: "hours",
    priority: 50,
    description: null,
    numbers: [
      {
        label: "Phone:",
        number: "800-426-9143"
      }
    ]
  }
];
