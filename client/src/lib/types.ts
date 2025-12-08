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

export let TOPICS: string[] = [];

export const updateTopics = (newTopics: string[]) => {
  TOPICS = newTopics;
};

export const MOCK_STUDENTS: Student[] = [];

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
