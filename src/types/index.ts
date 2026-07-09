export interface Skill {
  title: string;
  desc: string;
  icon: string;
}

export interface Project {
  title: string;
  desc: string;
  tag: string;
  year: string;
  image?: string;
  url?: string;
  github?: string;
  techs?: string[];
  featured?: boolean;
  fullDescription?: string;
  challenge?: string;
  solution?: string;
  results?: string[];
  gallery?: string[];
  role?: string;
  team?: string;
  duration?: string;
}

export interface SocialLink {
  name: string;
  url: string;
}

export interface AboutInfo {
  label: string;
  value: string;
  hasStatus?: boolean;
}
