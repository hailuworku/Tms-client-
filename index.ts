import { Temporal } from "@js-temporal/polyfill";
import { Student, isStudent, parseStudent } from "./models/student.model.js";
import { AssessmentItem, calculateGrade } from "./models/assessment.model.js";
import { EnrollmentStatus, describeEnrollment } from "./models/enrollment.model.js";
import { CourseStatus, describeCourse } from "./models/course.model.js";
import { Course } from "./models/course.model.js";
import { ApiResponse, renderResponse } from "./models/api-response.model.js";

// ── Session 1 ──────────────────────────────────────────────────────────────
const student: Student = {
  id: "STU-001",
  name: "Hana Tadesse",
  enrollmentDate: Temporal.Now.instant(),
};
console.log(student.gpa?.toFixed(2) ?? "Not yet graded");

function processStudent(raw: unknown) {
  if (isStudent(raw)) {
    console.log(`Student ${raw.name} GPA: ${raw.gpa?.toFixed(2) ?? "Not yet graded"}`);
  } else {
    console.error("Invalid student data received");
  }
}
processStudent({ id: "STU-001", name: "Hana", gpa: 3.7 });
processStudent(42);
console.log(parseStudent({ id: "STU-001", name: "Hana" }));
try {
  parseStudent({ id: 42, name: "Test" });
} catch (e) {
  console.error((e as Error).message);
}

// ── Session 2 ──────────────────────────────────────────────────────────────
const quiz: AssessmentItem = {
  id: "QUIZ-001", kind: "quiz", title: "SQL Basics",
  correctAnswers: 8, totalQuestions: 10,
};
const lab: AssessmentItem = {
  id: "LAB-001", kind: "lab", title: "REST API Project",
  functionalityScore: 85, codeQualityScore: 90,
};
console.log(`Quiz grade: ${calculateGrade(quiz)}%`);
console.log(`Lab grade: ${calculateGrade(lab)}%`);

const pending: EnrollmentStatus = {
  status: "PENDING", requestedAt: Temporal.Now.instant(),
  studentId: "STU-001", courseId: "CRS-101",
};
console.log(describeEnrollment(pending));

const webDev: CourseStatus = {
  status: "ACTIVE", enrolledCount: 28,
  startDate: Temporal.PlainDate.from("2026-09-01"),
};
console.log(describeCourse(webDev));

const studentRes: ApiResponse<Student> = {
  status: "success",
  data: { id: "STU-001", name: "Dawit Bekele", enrollmentDate: Temporal.Now.instant(), gpa: 3.4 },
  fetchedAt: Temporal.Now.instant(),
};
console.log(renderResponse(studentRes, (s) => `${s.name} GPA: ${s.gpa ?? "N/A"}`));

const courseListRes: ApiResponse<Course[]> = {
  status: "success",
  data: [{ id: "CRS-101", title: "Web Development Fundamentals", capacity: 30 }],
  fetchedAt: Temporal.Now.instant(),
};
console.log(renderResponse(courseListRes, (courses) => courses.map((c) => c.title).join(", ")));

const approvedAt = Temporal.Now.instant();
console.log(`Approved at (UTC): ${approvedAt}`);
const addisTime = approvedAt.toZonedDateTimeISO("Africa/Addis_Ababa");
const londonTime = approvedAt.toZonedDateTimeISO("Europe/London");
console.log(`Addis: ${addisTime.toPlainTime()}`);
console.log(`London: ${londonTime.toPlainTime()}`);
const courseStart = Temporal.PlainDate.from("2026-09-01");
const today = Temporal.Now.plainDateISO();
console.log(`${Math.floor(today.until(courseStart).total({ unit: "days" }))} days until course starts`);
console.log(`${today.until(Temporal.PlainDate.from("2026-12-15")).total({ unit: "days" })} days until assignment is due`);

// ── Session 3 ──────────────────────────────────────────────────────────────

// Exercise 8a: satisfies — validate shape without losing literal types
const templateStudent = {
  id: "STU-000",
  name: "Template",
  enrollmentDate: Temporal.Now.instant(),
} satisfies Student;
console.log(`Template student id: ${templateStudent.id}`);

// Exercise 8b: async/await + error handling
async function fetchStudents(courseId: string): Promise<Student[]> {
  try {
    const response = await fetch(`https://jsonplaceholder.typicode.com/users`);
    if (!response.ok) throw new Error(`HTTP ${response.status}`);

    const data: unknown = await response.json();
    if (!Array.isArray(data)) throw new TypeError("Expected array");

    // map to Student shape and filter valid ones
    const mapped = data.map((u) => ({
      id: `STU-${u.id}`,
      name: u.name,
      enrollmentDate: Temporal.Now.instant(),
    }));
    return mapped.filter(isStudent);
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    console.error(`Failed to fetch students for course ${courseId}: ${message}`);
    return [];
  }
}

// Exercise 8c: parallel fetching with Promise.all
async function fetchCourses(): Promise<Course[]> {
  return [
    { id: "CRS-101", title: "Web Development Fundamentals", capacity: 30 },
    { id: "CRS-102", title: "Database Design", capacity: 25 },
  ];
}

async function fetchEnrollments(studentId: string): Promise<string[]> {
  return [`${studentId} enrolled in CRS-101`, `${studentId} enrolled in CRS-102`];
}

async function main() {
  const [students, courses, enrollments] = await Promise.all([
    fetchStudents("CRS-101"),
    fetchCourses(),
    fetchEnrollments("STU-001"),
  ]);

  console.log(`\nFetched ${students.length} students`);
  console.log(`Fetched ${courses.length} courses: ${courses.map((c) => c.title).join(", ")}`);
  console.log(`Enrollments: ${enrollments.join(" | ")}`);
}

main();
