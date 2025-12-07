export interface Student {
  id: string;
  name: string;
  grade: string;
  school: string;
  parentName: string;
  phone: string;
  email: string;
  status: 'New' | 'Contacted' | 'Demo Completed' | 'Enrolled';
  lastActivity: string;
  areasOfImprovement?: string[];
}

export interface CurriculumConfig {
  methodology: 'LPP';
  classesPerWeek: 3 | 5;
  durationMonths: number;
  topics: string[];
}

export interface PricingConfig {
  basePricePerClass: number;
  sapEnabled: boolean;
  couponCode?: string;
  discountPercentage: number;
}

export const TOPICS = [
  "Mental Calculation",
  "Faster Calculation",
  "Arithmetic Foundation",
  "Logical Reasoning",
  "Word Problems",
  "Geometry Basics",
  "Algebraic Thinking",
  "Data Handling",
  "Pattern Recognition",
  "Olympiad Prep"
];

export const MOCK_STUDENTS: Student[] = [
  {
    id: "ST-2025-001",
    name: "Aarav Gupta",
    grade: "Grade 5",
    school: "DPS RK Puram",
    parentName: "Rajesh Gupta",
    phone: "+91 98765 43210",
    email: "rajesh.g@example.com",
    status: "Demo Completed",
    lastActivity: "2025-12-06",
    areasOfImprovement: ["Public Speaking", "Grammar"]
  },
  {
    id: "ST-2025-002",
    name: "Ishita Patel",
    grade: "Grade 3",
    school: "Vasant Valley",
    parentName: "Meera Patel",
    phone: "+91 98765 12345",
    email: "meera.p@example.com",
    status: "New",
    lastActivity: "2025-12-07"
  },
  {
    id: "ST-2025-003",
    name: "Rohan Kumar",
    grade: "Grade 7",
    school: "Modern School",
    parentName: "Suresh Kumar",
    phone: "+91 99887 76655",
    email: "suresh.k@example.com",
    status: "Contacted",
    lastActivity: "2025-12-05"
  }
];

export const PRICING_RULES = {
  baseRate3Classes: 750, // Per class
  baseRate5Classes: 650, // Per class
  sapDiscount: 0.15, // 15% off
  longTermDiscount: {
    6: 0.05, // 5% off for > 6 months
    12: 0.10, // 10% off for > 12 months
    18: 0.15, // 15% off for > 18 months
    24: 0.20  // 20% off for 24 months
  }
};
