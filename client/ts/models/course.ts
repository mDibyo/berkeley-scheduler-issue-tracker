import Section, {SectionJson} from './section';
import CourseInstance from './courseInstance';
import {Identifiable, ColorRegisterableIdentifiable, StringMap} from '../utils';
import {CourseInstanceJson} from "./courseInstance";


export type CourseJson = CourseInstanceJson[];


export default class Course extends ColorRegisterableIdentifiable implements Identifiable {
  id: string;
  department: string;
  courseNumber: string;
  title: string;
  description: string;
  units: number;

  selected: boolean = false;
  color: string;

  instances: CourseInstance[];

  constructor(courseJson: CourseJson) {
    super();

    const courseInfo: CourseInstanceJson = courseJson[0];

    this.department = courseInfo.sAC;
    this.courseNumber = courseInfo.cN;
    this.title = courseInfo.title;
    this.description = courseInfo.description;
    this.id = courseInfo.id;
    this.units = courseInfo.units;

    this.instances = courseJson.map((ciJson: CourseInstanceJson) => {
      const primarySections: Section[] = [];
      const secondarySections: Section[] = [];
      ciJson.sections.forEach((sectionJson: SectionJson) => {
        const section = new Section(sectionJson);

        if (section.isPrimary) {
          primarySections.push(section);
        } else {
          secondarySections.push(section);
        }
      });

      return new CourseInstance(this, primarySections[0], secondarySections, ciJson.fExam);
    });
  }

  static parse(courseJson: CourseJson): Course {
    return new Course(courseJson);
  }

  getName(): string {
    return `${this.department} ${this.courseNumber}`;
  }
}
