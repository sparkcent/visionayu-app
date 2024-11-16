export const MAIN_URL = 'https://tst.visionayunagpur.com/server/';
export const BASE_URL = 'https://tst.visionayunagpur.com/server/app.php?type=';

export interface Item {
  id: number;
  nav: string;
  title: string;
  image: any;
  bgColor: string;
}
export interface Exam {
  id: any;
  title: string;
  questions: number;
  correct: number;
  duration: string;
  left: number;
  qbid:any;
  marks:any;
  submitted:any;
  myexamid:any;
  examid:any;
};

export interface Question {
  image: any;
  id: string;
  question: string;
  optionA: string;
  optionB: string;
  optionC: string;
  optionD: string;
  correct_option: string;
  selected_option: string;
  questionType: string;
  pairs: any;
  reference:any;
  status:any;
}

export interface Route {
  key: string;
  title: string;
}

export interface Section {
  title: string;
  description: string;
  source: string;
  id: string;
  format:string;
}