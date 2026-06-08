import { Temporal } from "@js-temporal/polyfill";
import { Student, isStudent, parseStudent } from "./models/student.model.js";

// --- Exercise 2: Test readonly and optional constraints ---
const student: Student = {
  id: "STU-001",
  name: "Hana Tadesse",
  enrollmentDate: Temporal.Now.instant(),
};

// Uncomment to see compile errors:
// student.id = "STU-999";           // Error: readonly
// console.log(student.gpa.toFixed(2)); // Error: possibly undefined

console.log(student.gpa?.toFixed(2) ?? "Not yet graded");

// --- Exercise 3: Type guard ---
function processStudent(raw: unknown) {
  if (isStudent(raw)) {
    const gpaDisplay = raw.gpa?.toFixed(2) ?? "Not yet graded";
    console.log(`Student ${raw.name} GPA: ${gpaDisplay}`);
  } else {
    console.error("Invalid student data received");
  }
}

processStudent({ id: "STU-001", name: "Hana", gpa: 3.7 });
processStudent(42);

// --- Exercise 3B: parseStudent ---
console.log(parseStudent({ id: "STU-001", name: "Hana" }));

try {
  parseStudent({ id: 42, name: "Test" });
} catch (e) {
  console.error((e as Error).message);
}
