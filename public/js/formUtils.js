/**
 * public/js/formUtils.js
 * Refactored to improve maintainability, readability, and reusability.
 * - Retains necessary functionality from the original.
 * - Comments on removed, kept, or refactored code for clarity.
 * - Organizes code into logical sections.
 */

// --- Imports ---
import { initializeQuillEditor, destroyQuillEditor } from './quillUtils.js'; // Handles rich-text editor setup.
import { createMinusButton, createAddAssessmentButton } from './uiElements.js'; // Generates dynamic UI buttons.
import { getValueById, setValueById, setDownloadLink, waitForElementToExist, validateQuillContent } from './helper.js'; // Helper functions for DOM interactions.
import { addOutcomeInput } from './assessmentManager.js'; // Manages learning outcome-related actions.
import { handleProgramChange, initializeAddOutcomeButtons, initializeSLOListeners, initializeEventListeners, initializeWeightingTable } from './eventInit.js'; // Handles changes in program selection.
import { syllabusForm } from './formScript.js'; // Handles form submissions
import { updateLearningOutcomesAndAssessments } from './assessmentManager.js';

/**
 * --- Utility Functions ---
 * Refactored to promote reusability and simplify common operations.
 * Removes inline DOM manipulation for consistency and clarity.
 */

/**
 * Sets the value of an element by ID.
 * - Added for cleaner value-setting logic.
 * - Replaces direct DOM manipulations in multiple areas.
 */
const setElementValue = (id, value = '') => {
    const element = document.getElementById(id);
    if (element) element.value = value;
    else console.warn(`Element with id "${id}" not found.`);
};

/**
 * Populates multiple fields with values or defaults.
 * - Combines value assignment for multiple fields into a single reusable function.
 * - Replaces repetitive logic in older functions.
 */
const populateFields = (fields, data, defaults = {}) => {
    fields.forEach((field) => {
        const value = data[field] ?? defaults[field] ?? '';
        setElementValue(field, value);
    });
};

/**
 * Logs missing DOM element warnings.
 * - Centralizes error handling for missing DOM elements.
 */
const logMissingElement = (id) => {
    console.warn(`Element with id "${id}" not found.`);
};

/**
 * --- Default Policies ---
 * Extracted and modularized to provide clarity and maintainability.
 * - Organizes default policy text by program.
 */
const defaultPolicies = {
    BSN: {
        generalPolicies: `This course will abide by all Jefferson College of Nursing and Thomas Jefferson University policies. Students are responsible for knowing and adhering to University policies (https://www.jefferson.edu/academicpolicies) and policies as outlined in the Jefferson College of Nursing Student Handbook & Course Catalog.`,
        courseMinimumGrade: `A minimum grade of B- (80) is required in all MSN program courses in order to progress in the curriculum. Per program policy, only final grades will be rounded to the nearest whole number. Exam and quiz scores will not be rounded and will be entered in grade book in Canvas to the nearest hundredth of a percent.\nFor more information, please see the Academic Progression policy in the Jefferson College of Nursing Student Handbook & Course Catalog.`,
        lateMakeupWork: `For the Jefferson College of Nursing policy on late and make-up work, please see the Guidelines for Written Course Assignments section of the Jefferson College of Nursing Student Handbook & Course Catalog.`,
        attendance: `Attendance is expected in all classes for which a student is registered. Faculty, in conjunction with the academic program/department, determines attendance requirements for each course. Please see the Thomas Jefferson University Attendance policy and the Jefferson College of Nursing Student Handbook & Course Catalog for information regarding class, laboratory, and clinical attendance.\n\nStudents who have any symptoms that are associated with infectious diseases (e.g., cold, flu, or viral infection) should not attend in-person classes, clinical experiences, or other activities that put them in close contact with other students, faculty, staff, or patients. These symptoms can include but are not limited to sneezing, coughing, fever, gastrointestinal pain, and diarrhea. Students with these symptoms should contact Student Health Services (East Falls campus) or Jefferson Occupational Health Network (JOHN) (Center City campus) if these symptoms are present before participating in any classroom, clinical, lab, or studio sessions, or any activities in which other students, faculty, staff, or patients are present. Students who have these symptoms are responsible for notifying their instructors, program, or college using the usual mechanisms before missing any scheduled course/clinical education activity, for staying current with course/clinical requirements, and for complying with any other course/clinical attendance policies. Students may be asked to provide documentation that they are under the care of a medical provider (without disclosure of any medical condition).`,
        incomplete: `Please refer to the Failure to Complete a Course and the Grading System policies in the Jefferson College of Nursing Student Handbook & Course Catalog.`,
        withdrawal: `Please see the Course Withdrawal policy in the Jefferson College of Nursing Student Handbook & Course Catalog.\nFor withdrawal deadlines, please refer to the appropriate Academic Calendar.`,
        academicRights: `The Academic Responsibility Contract in the Jefferson College of Nursing Student Handbook & Course Catalog contains information about Jefferson College of Nursing students’ academic rights and responsibilities.\nFor more information about students’ rights and responsibilities, please refer to the Thomas Jefferson University Rights and Responsibilities page.`,
        academicIntegrity: `Academic Integrity is the foundation of all Jefferson teaching, learning, and professional endeavors and is vital to advancing a culture of fairness, trust, and respect. All members of the University community must maintain respect for the intellectual efforts of others and be honest in their own work, words, and ideas.\nFor more information, please see the Thomas Jefferson University Academic Integrity policy and Academic Integrity policy in the Jefferson College of Nursing Student Handbook & Course Catalog.`,
        netiquette: `Faculty and fellow students wish to foster a safe online learning environment consistent with Thomas Jefferson University’s Community Standards. In keeping with Thomas Jefferson University’s Commitment to Diversity, all opinions and experiences, no matter how different or controversial they may be perceived, must be respected in the tolerant spirit of academic discourse. Students are encouraged to comment, question, or critique an idea but are not to attack an individual.\n\nOur differences will add richness to this learning experience. Please consider that sarcasm and humor can be misconstrued in online interactions and generate unintended disruptions. Working as a community of learners, we can build a polite and respectful course atmosphere.`,
        diversityInclusion: `Jefferson holds itself accountable at every level of the organization to nurture an environment of inclusion and respect by valuing the uniqueness of every individual, celebrating and reflecting the rich diversity of its communities, and taking meaningful action to cultivate an environment of fairness, belonging, and opportunity.\nAll students are enrolled in the Diversity & Inclusion at TJU canvas course, which will provide access to resources and current events sponsored by the Office of Diversity Inclusion and Community Engagement.\nThe Diversity Inclusion & Community Engagement page:\nhttps://diversity.jefferson.edu/`,
        chosenName: `Some members of our community use a name, gender, and pronoun other than their legal identifiers. Students are free to elect to have their chosen first name, gender identity, and chosen pronoun appear in Thomas Jefferson University’s system.\nhttps://www.jefferson.edu/life-at-jefferson/handbooks/policies/graduate-policies/chosen-name.html`,
        religiousObservance: `The University understands that some students may wish to observe religious holidays that fall on scheduled class days.\nhttps://www.jefferson.edu/life-at-jefferson/handbooks/policies/graduate-policies/student-religious-observance-policy.html`,
        academicSupport: `Student academic support sessions are facilitated by Jefferson College of Nursing faculty members, available on an individual basis or as a group and open to all students wishing to seek additional academic support at any point during the course of study. The student academic support sessions are in addition to academic advising.`,
        disabilityDisclosure: `Accessibility Services complies with Section 504 and the ADA, providing reasonable accommodations to students who are eligible for such services. In post-secondary education, the student has the right to request accommodations and must be proactive and initiate the process. Disclosure of a student’s disability is voluntary and at the discretion of the student. Documentation concerning disabilities is separate from the student’s general academic file. Please contact the Office of Student Accessibility Services at:\n\nEast Falls Campus:  https://www.jefferson.edu/east-falls/student-accessibility-services.html\nCenter City/Dixon Campus:  https://www.jefferson.edu/life-at-jefferson/student-resources-services/academics-career-success/accessibility-services.html\n\nSee the University policy on Disability Accommodations for more information.`,
        informationTechnologies: `Analysts in Jefferson’s Information Systems and Technologies (IS&T) team are available to answer your technology questions or issues.\n\nCenter City/Dixon: 215-955-7975\nhttps://library.jefferson.edu/tech/\n\nEast Falls: 215-951-4648 Search Hall, first floor\nhttp://eastfalls.jefferson.edu/OIR/TechnologyHelpDesk.html`,
        counselingServices: `The Student Counseling Center provides assistance in addressing personal challenges that interfere with academic progress and growth.\n\nCenter City/Dixon: 33 S. Ninth Street, Suite 230, 215-503-2817\nContact: https://www.jefferson.edu/life-at-jefferson/health-wellness/counseling-center/contact.html\nServices: https://www.jefferson.edu/life-at-jefferson/health-wellness/counseling-center/our-services.html\nCrisis Resources: https://www.jefferson.edu/life-at-jefferson/health-wellness/counseling-center/crisis-resources.html\n\nEast Falls: Kanbar Campus Center, 215-951-2868\nhttp://www.eastfalls.jefferson.edu/counseling/`,
        titleIX: `The University’s Sex and Gender-Based Misconduct Policy sets forth Jefferson’s commitment to foster an environment free of discrimination, including sexual harassment and sexual violence.\nhttps://www.jefferson.edu/university/academic-affairs/schools/student-affairs/sexual-misconduct.html`,
        continuityInstruction: `For information about continuity of instruction in the event of an emergency, please reference the Thomas Jefferson University Inclement Weather policy and the Continuity of Instruction in Event of Emergency policy in the Jefferson College of Nursing Student Handbook & Course Catalog.`
    },
    MSN: {
        generalPolicies: `MSN This course will abide by all Jefferson College of Nursing and Thomas Jefferson University policies. Students are responsible for knowing and adhering to University policies (https://www.jefferson.edu/academicpolicies) and policies as outlined in the Jefferson College of Nursing Student Handbook & Course Catalog.`,
        courseMinimumGrade: `A minimum grade of B- (80) is required in all MSN program courses in order to progress in the curriculum. Per program policy, only final grades will be rounded to the nearest whole number. Exam and quiz scores will not be rounded and will be entered in grade book in Canvas to the nearest hundredth of a percent.\nFor more information, please see the Academic Progression policy in the Jefferson College of Nursing Student Handbook & Course Catalog.`,
        lateMakeupWork: `For the Jefferson College of Nursing policy on late and make-up work, please see the Guidelines for Written Course Assignments section of the Jefferson College of Nursing Student Handbook & Course Catalog.`,
        attendance: `Attendance is expected in all classes for which a student is registered. Faculty, in conjunction with the academic program/department, determines attendance requirements for each course. Please see the Thomas Jefferson University Attendance policy and the Jefferson College of Nursing Student Handbook & Course Catalog for information regarding class, laboratory, and clinical attendance.\n\nStudents who have any symptoms that are associated with infectious diseases (e.g., cold, flu, or viral infection) should not attend in-person classes, clinical experiences, or other activities that put them in close contact with other students, faculty, staff, or patients. These symptoms can include but are not limited to sneezing, coughing, fever, gastrointestinal pain, and diarrhea. Students with these symptoms should contact Student Health Services (East Falls campus) or Jefferson Occupational Health Network (JOHN) (Center City campus) if these symptoms are present before participating in any classroom, clinical, lab, or studio sessions, or any activities in which other students, faculty, staff, or patients are present. Students who have these symptoms are responsible for notifying their instructors, program, or college using the usual mechanisms before missing any scheduled course/clinical education activity, for staying current with course/clinical requirements, and for complying with any other course/clinical attendance policies. Students may be asked to provide documentation that they are under the care of a medical provider (without disclosure of any medical condition).`,
        incomplete: `Please refer to the Failure to Complete a Course and the Grading System policies in the Jefferson College of Nursing Student Handbook & Course Catalog.`,
        withdrawal: `Please see the Course Withdrawal policy in the Jefferson College of Nursing Student Handbook & Course Catalog.\nFor withdrawal deadlines, please refer to the appropriate Academic Calendar.`,
        academicRights: `The Academic Responsibility Contract in the Jefferson College of Nursing Student Handbook & Course Catalog contains information about Jefferson College of Nursing students’ academic rights and responsibilities.\nFor more information about students’ rights and responsibilities, please refer to the Thomas Jefferson University Rights and Responsibilities page.`,
        academicIntegrity: `Academic Integrity is the foundation of all Jefferson teaching, learning, and professional endeavors and is vital to advancing a culture of fairness, trust, and respect. All members of the University community must maintain respect for the intellectual efforts of others and be honest in their own work, words, and ideas.\nFor more information, please see the Thomas Jefferson University Academic Integrity policy and Academic Integrity policy in the Jefferson College of Nursing Student Handbook & Course Catalog.`,
        netiquette: `Faculty and fellow students wish to foster a safe online learning environment consistent with Thomas Jefferson University’s Community Standards. In keeping with Thomas Jefferson University’s Commitment to Diversity, all opinions and experiences, no matter how different or controversial they may be perceived, must be respected in the tolerant spirit of academic discourse. Students are encouraged to comment, question, or critique an idea but are not to attack an individual.\n\nOur differences will add richness to this learning experience. Please consider that sarcasm and humor can be misconstrued in online interactions and generate unintended disruptions. Working as a community of learners, we can build a polite and respectful course atmosphere.`,
        diversityInclusion: `Jefferson holds itself accountable at every level of the organization to nurture an environment of inclusion and respect by valuing the uniqueness of every individual, celebrating and reflecting the rich diversity of its communities, and taking meaningful action to cultivate an environment of fairness, belonging, and opportunity.\nAll students are enrolled in the Diversity & Inclusion at TJU canvas course, which will provide access to resources and current events sponsored by the Office of Diversity Inclusion and Community Engagement.\nThe Diversity Inclusion & Community Engagement page:\nhttps://diversity.jefferson.edu/`,
        chosenName: `Some members of our community use a name, gender, and pronoun other than their legal identifiers. Students are free to elect to have their chosen first name, gender identity, and chosen pronoun appear in Thomas Jefferson University’s system.\nhttps://www.jefferson.edu/life-at-jefferson/handbooks/policies/graduate-policies/chosen-name.html`,
        religiousObservance: `The University understands that some students may wish to observe religious holidays that fall on scheduled class days.\nhttps://www.jefferson.edu/life-at-jefferson/handbooks/policies/graduate-policies/student-religious-observance-policy.html`,
        academicSupport: `Student academic support sessions are facilitated by Jefferson College of Nursing faculty members, available on an individual basis or as a group and open to all students wishing to seek additional academic support at any point during the course of study. The student academic support sessions are in addition to academic advising.`,
        disabilityDisclosure: `Accessibility Services complies with Section 504 and the ADA, providing reasonable accommodations to students who are eligible for such services. In post-secondary education, the student has the right to request accommodations and must be proactive and initiate the process. Disclosure of a student’s disability is voluntary and at the discretion of the student. Documentation concerning disabilities is separate from the student’s general academic file. Please contact the Office of Student Accessibility Services at:\n\nEast Falls Campus:  https://www.jefferson.edu/east-falls/student-accessibility-services.html\nCenter City/Dixon Campus:  https://www.jefferson.edu/life-at-jefferson/student-resources-services/academics-career-success/accessibility-services.html\n\nSee the University policy on Disability Accommodations for more information.`,
        informationTechnologies: `Analysts in Jefferson’s Information Systems and Technologies (IS&T) team are available to answer your technology questions or issues.\n\nCenter City/Dixon: 215-955-7975\nhttps://library.jefferson.edu/tech/\n\nEast Falls: 215-951-4648 Search Hall, first floor\nhttp://eastfalls.jefferson.edu/OIR/TechnologyHelpDesk.html`,
        counselingServices: `The Student Counseling Center provides assistance in addressing personal challenges that interfere with academic progress and growth.\n\nCenter City/Dixon: 33 S. Ninth Street, Suite 230, 215-503-2817\nContact: https://www.jefferson.edu/life-at-jefferson/health-wellness/counseling-center/contact.html\nServices: https://www.jefferson.edu/life-at-jefferson/health-wellness/counseling-center/our-services.html\nCrisis Resources: https://www.jefferson.edu/life-at-jefferson/health-wellness/counseling-center/crisis-resources.html\n\nEast Falls: Kanbar Campus Center, 215-951-2868\nhttp://www.eastfalls.jefferson.edu/counseling/`,
        titleIX: `The University’s Sex and Gender-Based Misconduct Policy sets forth Jefferson’s commitment to foster an environment free of discrimination, including sexual harassment and sexual violence.\nhttps://www.jefferson.edu/university/academic-affairs/schools/student-affairs/sexual-misconduct.html`,
        continuityInstruction: `For information about continuity of instruction in the event of an emergency, please reference the Thomas Jefferson University Inclement Weather policy and the Continuity of Instruction in Event of Emergency policy in the Jefferson College of Nursing Student Handbook & Course Catalog.`
    },
    DNP: {
        generalPolicies: `DNP This course will abide by all Jefferson College of Nursing and Thomas Jefferson University policies. Students are responsible for knowing and adhering to University policies (https://www.jefferson.edu/academicpolicies) and policies as outlined in the Jefferson College of Nursing Student Handbook & Course Catalog.`,
        courseMinimumGrade: `A minimum grade of B- (80) is required in all MSN program courses in order to progress in the curriculum. Per program policy, only final grades will be rounded to the nearest whole number. Exam and quiz scores will not be rounded and will be entered in grade book in Canvas to the nearest hundredth of a percent.\nFor more information, please see the Academic Progression policy in the Jefferson College of Nursing Student Handbook & Course Catalog.`,
        lateMakeupWork: `For the Jefferson College of Nursing policy on late and make-up work, please see the Guidelines for Written Course Assignments section of the Jefferson College of Nursing Student Handbook & Course Catalog.`,
        attendance: `Attendance is expected in all classes for which a student is registered. Faculty, in conjunction with the academic program/department, determines attendance requirements for each course. Please see the Thomas Jefferson University Attendance policy and the Jefferson College of Nursing Student Handbook & Course Catalog for information regarding class, laboratory, and clinical attendance.\n\nStudents who have any symptoms that are associated with infectious diseases (e.g., cold, flu, or viral infection) should not attend in-person classes, clinical experiences, or other activities that put them in close contact with other students, faculty, staff, or patients. These symptoms can include but are not limited to sneezing, coughing, fever, gastrointestinal pain, and diarrhea. Students with these symptoms should contact Student Health Services (East Falls campus) or Jefferson Occupational Health Network (JOHN) (Center City campus) if these symptoms are present before participating in any classroom, clinical, lab, or studio sessions, or any activities in which other students, faculty, staff, or patients are present. Students who have these symptoms are responsible for notifying their instructors, program, or college using the usual mechanisms before missing any scheduled course/clinical education activity, for staying current with course/clinical requirements, and for complying with any other course/clinical attendance policies. Students may be asked to provide documentation that they are under the care of a medical provider (without disclosure of any medical condition).`,
        incomplete: `Please refer to the Failure to Complete a Course and the Grading System policies in the Jefferson College of Nursing Student Handbook & Course Catalog.`,
        withdrawal: `Please see the Course Withdrawal policy in the Jefferson College of Nursing Student Handbook & Course Catalog.\nFor withdrawal deadlines, please refer to the appropriate Academic Calendar.`,
        academicRights: `The Academic Responsibility Contract in the Jefferson College of Nursing Student Handbook & Course Catalog contains information about Jefferson College of Nursing students’ academic rights and responsibilities.\nFor more information about students’ rights and responsibilities, please refer to the Thomas Jefferson University Rights and Responsibilities page.`,
        academicIntegrity: `Academic Integrity is the foundation of all Jefferson teaching, learning, and professional endeavors and is vital to advancing a culture of fairness, trust, and respect. All members of the University community must maintain respect for the intellectual efforts of others and be honest in their own work, words, and ideas.\nFor more information, please see the Thomas Jefferson University Academic Integrity policy and Academic Integrity policy in the Jefferson College of Nursing Student Handbook & Course Catalog.`,
        netiquette: `Faculty and fellow students wish to foster a safe online learning environment consistent with Thomas Jefferson University’s Community Standards. In keeping with Thomas Jefferson University’s Commitment to Diversity, all opinions and experiences, no matter how different or controversial they may be perceived, must be respected in the tolerant spirit of academic discourse. Students are encouraged to comment, question, or critique an idea but are not to attack an individual.\n\nOur differences will add richness to this learning experience. Please consider that sarcasm and humor can be misconstrued in online interactions and generate unintended disruptions. Working as a community of learners, we can build a polite and respectful course atmosphere.`,
        diversityInclusion: `Jefferson holds itself accountable at every level of the organization to nurture an environment of inclusion and respect by valuing the uniqueness of every individual, celebrating and reflecting the rich diversity of its communities, and taking meaningful action to cultivate an environment of fairness, belonging, and opportunity.\nAll students are enrolled in the Diversity & Inclusion at TJU canvas course, which will provide access to resources and current events sponsored by the Office of Diversity Inclusion and Community Engagement.\nThe Diversity Inclusion & Community Engagement page:\nhttps://diversity.jefferson.edu/`,
        chosenName: `Some members of our community use a name, gender, and pronoun other than their legal identifiers. Students are free to elect to have their chosen first name, gender identity, and chosen pronoun appear in Thomas Jefferson University’s system.\nhttps://www.jefferson.edu/life-at-jefferson/handbooks/policies/graduate-policies/chosen-name.html`,
        religiousObservance: `The University understands that some students may wish to observe religious holidays that fall on scheduled class days.\nhttps://www.jefferson.edu/life-at-jefferson/handbooks/policies/graduate-policies/student-religious-observance-policy.html`,
        academicSupport: `Student academic support sessions are facilitated by Jefferson College of Nursing faculty members, available on an individual basis or as a group and open to all students wishing to seek additional academic support at any point during the course of study. The student academic support sessions are in addition to academic advising.`,
        disabilityDisclosure: `Accessibility Services complies with Section 504 and the ADA, providing reasonable accommodations to students who are eligible for such services. In post-secondary education, the student has the right to request accommodations and must be proactive and initiate the process. Disclosure of a student’s disability is voluntary and at the discretion of the student. Documentation concerning disabilities is separate from the student’s general academic file. Please contact the Office of Student Accessibility Services at:\n\nEast Falls Campus:  https://www.jefferson.edu/east-falls/student-accessibility-services.html\nCenter City/Dixon Campus:  https://www.jefferson.edu/life-at-jefferson/student-resources-services/academics-career-success/accessibility-services.html\n\nSee the University policy on Disability Accommodations for more information.`,
        informationTechnologies: `Analysts in Jefferson’s Information Systems and Technologies (IS&T) team are available to answer your technology questions or issues.\n\nCenter City/Dixon: 215-955-7975\nhttps://library.jefferson.edu/tech/\n\nEast Falls: 215-951-4648 Search Hall, first floor\nhttp://eastfalls.jefferson.edu/OIR/TechnologyHelpDesk.html`,
        counselingServices: `The Student Counseling Center provides assistance in addressing personal challenges that interfere with academic progress and growth.\n\nCenter City/Dixon: 33 S. Ninth Street, Suite 230, 215-503-2817\nContact: https://www.jefferson.edu/life-at-jefferson/health-wellness/counseling-center/contact.html\nServices: https://www.jefferson.edu/life-at-jefferson/health-wellness/counseling-center/our-services.html\nCrisis Resources: https://www.jefferson.edu/life-at-jefferson/health-wellness/counseling-center/crisis-resources.html\n\nEast Falls: Kanbar Campus Center, 215-951-2868\nhttp://www.eastfalls.jefferson.edu/counseling/`,
        titleIX: `The University’s Sex and Gender-Based Misconduct Policy sets forth Jefferson’s commitment to foster an environment free of discrimination, including sexual harassment and sexual violence.\nhttps://www.jefferson.edu/university/academic-affairs/schools/student-affairs/sexual-misconduct.html`,
        continuityInstruction: `For information about continuity of instruction in the event of an emergency, please reference the Thomas Jefferson University Inclement Weather policy and the Continuity of Instruction in Event of Emergency policy in the Jefferson College of Nursing Student Handbook & Course Catalog.`
    },
}

const programOutcomes = {
    BSN: [
        "Apply knowledge and principles from the arts, sciences, and humanities to the developmental, psychosocial, spiritual, and physical care of individuals, families, communities, and populations. (Essential I)",
        "Integrate knowledge and skills in leadership, quality and patient safety into the provision of nursing care to individuals, families, communities, and populations across the care continuum. (Essential II)",
        "Incorporate reflection, critical appraisal, clinical reasoning, and current best evidence into the delivery of care to individuals, families, communities, and populations. (Essential III)",
        "Utilize information management and emerging healthcare technologies in the delivery of quality nursing care. (Essentials II, IV)",
        "Recognize the influence healthcare policies, including financial, legal and regulatory, have on health system functioning and the broader determinants of health. (Essential V)",
        "Utilize open communication, shared-decision making, creative problem solving, and mutual respect when collaborating with nursing and interprofessional teams. (Essential VI)",
        "Incorporate strategies of health promotion and disease prevention in addressing health outcomes and determinants in communities and populations. (Essential VII)",
        "Demonstrate professionalism and the values of altruism, autonomy, human dignity, integrity, and social justice in the nursing care of individuals, families, communities and populations. (Essentials VIII, IX)"
    ],
    MSN: [
        "Integrate relevant knowledge, principles and theories from nursing and related sciences into the advanced nursing care of individuals, families and populations. (Essential I)",
        "Demonstrate acumen in organizational leadership through effective collaboration, consultation, and decision-making. (Essential II)",
        "Integrate research translation and evidence appraisal into advanced nursing practice to initiate change and improve quality outcomes. (Essential IV)",
        "Evaluate information science approaches and patient-centric technologies to improve health outcomes and enhance quality of care. (Essentials III, V)",
        "Analyze the impact policies, economic factors, and ethical and socio-cultural dimensions have on advanced nursing practice and health care outcomes. (Essential VI)",
        "Integrate the concepts of interprofessional communication, collaboration and consultation to effectively manage and coordinate care across systems. (Essential VII)",
        "Incorporate culturally-appropriate concepts in the planning and delivery of evidence-based preventive and clinical care to communities, and populations. (Essential VIII)",
        "Demonstrate expertise in a defined area of advanced practice nursing that influences health care outcomes for individuals, populations and systems. (Essential IX)"
    ],
    DNP: [
        "Synthesize knowledge from ethics and the biophysical, psychosocial, analytical, and organizational sciences into the conceptual foundation of advanced nursing practice at the doctoral level. (Essential I)",
        "Employ organizational and systems-level leadership principles in the development and evaluation of care delivery approaches that meet the current and future needs of communities and populations. (Essential II)",
        "Design, direct and evaluate scholarly inquiries that incorporate evidence appraisal, research translation, and standards of care to improve practice and the practice environment. (Essential III)",
        "Analyze ethical and legal issues in the use of information, information technology, communication networks, and patient care technologies used to support safe, high-quality patient care. (Essentials II, IV)",
        "Influence policy makers through active participation on committees, boards, or task forces at the institutional, local, state, regional, national, and/or international levels to improve health care delivery and outcomes. (Essential V)",
        "Integrate skills of effective communication, collaboration, shared decision-making, and leadership with interprofessional teams to create change in health care. (Essential VI)",
        "Synthesize individual, aggregate, and population health data in the development, implementation, and evaluation of interventions that address health promotion/disease prevention, access, and disparities. (Essential VII)",
        "Demonstrate advanced levels of leadership, systems thinking, clinical judgement, and analytical skills in designing, delivering, and evaluating evidence-based care at the highest level of advanced practice. (Essential VIII)"
    ]
};

const sloMapping = {
    BSN: {
        1: [
            "Demonstrate an understanding of the developmental, psychosocial, and physical care principles in patient scenarios.",
            "Analyze case studies to apply principles of the arts, sciences, and humanities in nursing care."
        ],
        2: [
            "Apply leadership and quality improvement concepts in simulated care environments.",
            "Critique quality and safety initiatives in clinical practice."
        ],
        3: [
            "Utilize critical thinking and evidence-based practices to solve complex nursing problems.",
            "Reflect on nursing practice to identify areas for improvement."
        ],
        4: [
            "Demonstrate proficiency in the use of healthcare technologies during patient care simulations.",
            "Evaluate the effectiveness of information systems in improving care delivery."
        ],
        5: [
            "Assess the impact of healthcare policies on patient care and outcomes.",
            "Advocate for legal and regulatory improvements in healthcare systems."
        ],
        6: [
            "Effectively collaborate with interdisciplinary teams in case management scenarios.",
            "Apply principles of shared decision-making in patient care plans."
        ],
        7: [
            "Design health promotion strategies for diverse populations.",
            "Implement disease prevention programs tailored to community needs."
        ],
        8: [
            "Exemplify professionalism and integrity in simulated patient care.",
            "Advocate for social justice and autonomy in community health settings."
        ]
    },
    MSN: {
        1: [
            "Integrate advanced nursing theories in complex care delivery models.",
            "Analyze the application of principles from nursing and related sciences in patient care."
        ],
        2: [
            "Demonstrate effective decision-making in interprofessional leadership roles.",
            "Evaluate organizational strategies to improve care quality."
        ],
        3: [
            "Critique research articles to support evidence-based nursing practices.",
            "Implement evidence-based changes to improve quality outcomes."
        ],
        4: [
            "Evaluate patient-centric technologies for their impact on health outcomes.",
            "Apply information science approaches to improve healthcare delivery."
        ],
        5: [
            "Analyze the effects of policies and economic factors on patient care outcomes.",
            "Advocate for ethical decision-making in advanced nursing practices."
        ],
        6: [
            "Demonstrate interprofessional communication skills in managing patient care.",
            "Collaborate with healthcare teams to coordinate care across systems."
        ],
        7: [
            "Incorporate cultural competence in the development of community health interventions.",
            "Evaluate population health strategies for their effectiveness in preventive care."
        ],
        8: [
            "Develop expertise in a specialized area of advanced nursing practice.",
            "Influence health outcomes through advanced clinical decision-making."
        ]
    },
    DNP: {
        1: [
            "Synthesize knowledge from multiple sciences into advanced nursing practice scenarios.",
            "Demonstrate ethical decision-making in clinical practice."
        ],
        2: [
            "Apply leadership principles to redesign care delivery models.",
            "Evaluate systems-level interventions to meet population health needs."
        ],
        3: [
            "Design evidence-based interventions for improving clinical practice environments.",
            "Implement scholarly inquiries to evaluate healthcare practices."
        ],
        4: [
            "Analyze the ethical use of healthcare technologies in patient care.",
            "Evaluate legal considerations in information technology use."
        ],
        5: [
            "Participate in policy advocacy to improve healthcare delivery.",
            "Demonstrate leadership on boards or committees to influence healthcare policies."
        ],
        6: [
            "Collaborate with interprofessional teams to achieve healthcare change.",
            "Apply communication and decision-making skills to lead care initiatives."
        ],
        7: [
            "Develop population health programs addressing health disparities.",
            "Implement interventions to promote health and prevent disease."
        ],
        8: [
            "Exhibit advanced clinical judgment in designing evidence-based care plans.",
            "Evaluate healthcare systems for effectiveness in delivering high-level care."
        ]
    }
};

export { sloMapping };

/**
 * Fetches syllabus data and handles form population.
 * Refactored to improve error handling, modularity, and sessionStorage integration.
 * 
 * @returns {Promise<Object>} Resolves with the syllabus data or rejects with an error.
 */
export function loadSyllabusData() {
    return new Promise((resolve, reject) => {
        const syllabusId = new URLSearchParams(window.location.search).get('syllabusId');

        if (!syllabusId) {
            console.error('No syllabusId provided in URL.');
            reject('No syllabusId provided in URL.');
            return;
        }

        // Store the syllabusId in sessionStorage for consistent access
        sessionStorage.setItem('syllabusId', syllabusId);

        const fetchUrl = `/syllabus/view/${syllabusId}?format=json`;
        console.log(`Attempting to load syllabus data from: ${fetchUrl}`);

        fetch(fetchUrl)
            .then((response) => {
                if (!response.ok) {
                    const errorMsg = `Failed to load syllabus data. Status: ${response.status} (${response.statusText})`;
                    console.error(errorMsg);
                    throw new Error(errorMsg);
                }
                return response.json();
            })
            .then((data) => {
                if (!data || !data.syllabusData) {
                    throw new Error('Syllabus data format is incorrect or missing.');
                }

                const syllabusData = data.syllabusData;
                console.log('Syllabus Data Loaded:', syllabusData);

                // Log program outcomes and SLO data for debugging
                console.log('Program Outcomes Data:', syllabusData.programOutcomes || []);
                console.log('Student Learning Outcomes Data:', syllabusData.slo || {});

                // Apply default policies if they are not present in the syllabus data
                const programSelect = document.getElementById('programSelect')?.value || 'default';
                const defaultPolicies = getDefaultPolicies(programSelect);

                syllabusData.policiesAndServices = {
                    ...defaultPolicies,
                    ...syllabusData.policiesAndServices // Retain existing policies if available
                };

                // Ensure program outcomes and SLOs are properly structured
                syllabusData.programOutcomes = syllabusData.programOutcomes || [];
                syllabusData.slo = syllabusData.slo || {};

                console.log('Processed Syllabus Data:', syllabusData);

                // Resolve the loaded syllabus data
                resolve(syllabusData);
            })
            .catch((error) => {
                console.error('Error loading syllabus data:', error);
                reject(error);
            });
    });
}

/**
 * Returns the default policies for a given program.
 * 
 * @param {string} program - The program name (e.g., "BSN", "MSN", "DNP").
 * @returns {Object} An object containing default policies for the program.
 */
function getDefaultPolicies(program) {
    const policies = {
        BSN: {
            generalPolicies: `BSN This course will abide by all Jefferson College of Nursing and Thomas Jefferson University policies. Students are responsible for knowing and adhering to University policies (https://www.jefferson.edu/academicpolicies) and policies as outlined in the Jefferson College of Nursing Student Handbook & Course Catalog.`,
            courseMinimumGrade: `A minimum grade of B- (80) is required in all BSN program courses to progress in the curriculum. Per program policy, only final grades will be rounded to the nearest whole number. Exam and quiz scores will not be rounded and will be entered in the grade book in Canvas to the nearest hundredth of a percent. For more information, see the Academic Progression policy in the Jefferson College of Nursing Student Handbook & Course Catalog.`,
            lateMakeupWork: `For the Jefferson College of Nursing policy on late and make-up work, see the Guidelines for Written Course Assignments section of the Jefferson College of Nursing Student Handbook & Course Catalog.`,
            attendance: `Attendance is expected in all classes for which a student is registered. Faculty, in conjunction with the academic program/department, determines attendance requirements for each course. See the Thomas Jefferson University Attendance policy and the Jefferson College of Nursing Student Handbook & Course Catalog for information regarding class, laboratory, and clinical attendance.`,
            incomplete: `Please refer to the Failure to Complete a Course and the Grading System policies in the Jefferson College of Nursing Student Handbook & Course Catalog.`,
            withdrawal: `See the Course Withdrawal policy in the Jefferson College of Nursing Student Handbook & Course Catalog. For withdrawal deadlines, refer to the appropriate Academic Calendar.`,
            academicRights: `The Academic Responsibility Contract in the Jefferson College of Nursing Student Handbook & Course Catalog contains information about Jefferson College of Nursing students’ academic rights and responsibilities. For more information, see the Thomas Jefferson University Rights and Responsibilities page.`,
            academicIntegrity: `Academic Integrity is the foundation of all Jefferson teaching, learning, and professional endeavors. It is vital to advancing a culture of fairness, trust, and respect. For more information, see the Thomas Jefferson University Academic Integrity policy and the Academic Integrity policy in the Jefferson College of Nursing Student Handbook & Course Catalog.`,
            netiquette: `Faculty and fellow students wish to foster a safe online learning environment consistent with Thomas Jefferson University’s Community Standards. In keeping with Thomas Jefferson University’s Commitment to Diversity, all opinions and experiences, no matter how different or controversial, must be respected in the tolerant spirit of academic discourse. Students are encouraged to comment, question, or critique an idea but are not to attack an individual.`,
            diversityInclusion: `Jefferson holds itself accountable to nurture an environment of inclusion and respect by valuing the uniqueness of every individual and celebrating and reflecting the rich diversity of its communities.`,
            chosenName: `Students may elect to have their chosen first name, gender identity, and pronoun appear in the Thomas Jefferson University system. See the policy at https://www.jefferson.edu/life-at-jefferson/handbooks/policies/graduate-policies/chosen-name.html.`,
            religiousObservance: `The University understands that some students may wish to observe religious holidays that fall on scheduled class days. See the Student Religious Observance policy at https://www.jefferson.edu/life-at-jefferson/handbooks/policies/graduate-policies/student-religious-observance-policy.html.`,
            academicSupport: `Student academic support sessions are facilitated by Jefferson College of Nursing faculty members and are available individually or as a group.`,
            disabilityDisclosure: `Accessibility Services complies with Section 504 and the ADA to provide reasonable accommodations to students eligible for such services. Students must initiate the process and provide documentation. For more information, visit https://www.jefferson.edu/life-at-jefferson/student-resources-services/academics-career-success/accessibility-services.html.`,
            informationTechnologies: `Analysts in Jefferson’s Information Systems and Technologies (IS&T) team are available to answer technology questions or issues.`,
            counselingServices: `The Student Counseling Center provides assistance in addressing personal challenges that interfere with academic progress and growth.`,
            titleIX: `The University’s Sex and Gender-Based Misconduct Policy sets forth Jefferson’s commitment to foster an environment free of discrimination, including sexual harassment and sexual violence.`,
            continuityInstruction: `For continuity of instruction during emergencies, refer to the policies in the Jefferson College of Nursing Student Handbook & Course Catalog.`
        },
        MSN: {
            generalPolicies: `MSN This course will abide by all Jefferson College of Nursing and Thomas Jefferson University policies. Students are responsible for knowing and adhering to University policies (https://www.jefferson.edu/academicpolicies) and policies as outlined in the Jefferson College of Nursing Student Handbook & Course Catalog.`,
            courseMinimumGrade: `A minimum grade of B- (80) is required in all BSN program courses to progress in the curriculum. Per program policy, only final grades will be rounded to the nearest whole number. Exam and quiz scores will not be rounded and will be entered in the grade book in Canvas to the nearest hundredth of a percent. For more information, see the Academic Progression policy in the Jefferson College of Nursing Student Handbook & Course Catalog.`,
            lateMakeupWork: `For the Jefferson College of Nursing policy on late and make-up work, see the Guidelines for Written Course Assignments section of the Jefferson College of Nursing Student Handbook & Course Catalog.`,
            attendance: `Attendance is expected in all classes for which a student is registered. Faculty, in conjunction with the academic program/department, determines attendance requirements for each course. See the Thomas Jefferson University Attendance policy and the Jefferson College of Nursing Student Handbook & Course Catalog for information regarding class, laboratory, and clinical attendance.`,
            incomplete: `Please refer to the Failure to Complete a Course and the Grading System policies in the Jefferson College of Nursing Student Handbook & Course Catalog.`,
            withdrawal: `See the Course Withdrawal policy in the Jefferson College of Nursing Student Handbook & Course Catalog. For withdrawal deadlines, refer to the appropriate Academic Calendar.`,
            academicRights: `The Academic Responsibility Contract in the Jefferson College of Nursing Student Handbook & Course Catalog contains information about Jefferson College of Nursing students’ academic rights and responsibilities. For more information, see the Thomas Jefferson University Rights and Responsibilities page.`,
            academicIntegrity: `Academic Integrity is the foundation of all Jefferson teaching, learning, and professional endeavors. It is vital to advancing a culture of fairness, trust, and respect. For more information, see the Thomas Jefferson University Academic Integrity policy and the Academic Integrity policy in the Jefferson College of Nursing Student Handbook & Course Catalog.`,
            netiquette: `Faculty and fellow students wish to foster a safe online learning environment consistent with Thomas Jefferson University’s Community Standards. In keeping with Thomas Jefferson University’s Commitment to Diversity, all opinions and experiences, no matter how different or controversial, must be respected in the tolerant spirit of academic discourse. Students are encouraged to comment, question, or critique an idea but are not to attack an individual.`,
            diversityInclusion: `Jefferson holds itself accountable to nurture an environment of inclusion and respect by valuing the uniqueness of every individual and celebrating and reflecting the rich diversity of its communities.`,
            chosenName: `Students may elect to have their chosen first name, gender identity, and pronoun appear in the Thomas Jefferson University system. See the policy at https://www.jefferson.edu/life-at-jefferson/handbooks/policies/graduate-policies/chosen-name.html.`,
            religiousObservance: `The University understands that some students may wish to observe religious holidays that fall on scheduled class days. See the Student Religious Observance policy at https://www.jefferson.edu/life-at-jefferson/handbooks/policies/graduate-policies/student-religious-observance-policy.html.`,
            academicSupport: `Student academic support sessions are facilitated by Jefferson College of Nursing faculty members and are available individually or as a group.`,
            disabilityDisclosure: `Accessibility Services complies with Section 504 and the ADA to provide reasonable accommodations to students eligible for such services. Students must initiate the process and provide documentation. For more information, visit https://www.jefferson.edu/life-at-jefferson/student-resources-services/academics-career-success/accessibility-services.html.`,
            informationTechnologies: `Analysts in Jefferson’s Information Systems and Technologies (IS&T) team are available to answer technology questions or issues.`,
            counselingServices: `The Student Counseling Center provides assistance in addressing personal challenges that interfere with academic progress and growth.`,
            titleIX: `The University’s Sex and Gender-Based Misconduct Policy sets forth Jefferson’s commitment to foster an environment free of discrimination, including sexual harassment and sexual violence.`,
            continuityInstruction: `For continuity of instruction during emergencies, refer to the policies in the Jefferson College of Nursing Student Handbook & Course Catalog.`
        },
        DNP: {
            generalPolicies: `DNP This course will abide by all Jefferson College of Nursing and Thomas Jefferson University policies. Students are responsible for knowing and adhering to University policies (https://www.jefferson.edu/academicpolicies) and policies as outlined in the Jefferson College of Nursing Student Handbook & Course Catalog.`,
            courseMinimumGrade: `A minimum grade of B- (80) is required in all BSN program courses to progress in the curriculum. Per program policy, only final grades will be rounded to the nearest whole number. Exam and quiz scores will not be rounded and will be entered in the grade book in Canvas to the nearest hundredth of a percent. For more information, see the Academic Progression policy in the Jefferson College of Nursing Student Handbook & Course Catalog.`,
            lateMakeupWork: `For the Jefferson College of Nursing policy on late and make-up work, see the Guidelines for Written Course Assignments section of the Jefferson College of Nursing Student Handbook & Course Catalog.`,
            attendance: `Attendance is expected in all classes for which a student is registered. Faculty, in conjunction with the academic program/department, determines attendance requirements for each course. See the Thomas Jefferson University Attendance policy and the Jefferson College of Nursing Student Handbook & Course Catalog for information regarding class, laboratory, and clinical attendance.`,
            incomplete: `Please refer to the Failure to Complete a Course and the Grading System policies in the Jefferson College of Nursing Student Handbook & Course Catalog.`,
            withdrawal: `See the Course Withdrawal policy in the Jefferson College of Nursing Student Handbook & Course Catalog. For withdrawal deadlines, refer to the appropriate Academic Calendar.`,
            academicRights: `The Academic Responsibility Contract in the Jefferson College of Nursing Student Handbook & Course Catalog contains information about Jefferson College of Nursing students’ academic rights and responsibilities. For more information, see the Thomas Jefferson University Rights and Responsibilities page.`,
            academicIntegrity: `Academic Integrity is the foundation of all Jefferson teaching, learning, and professional endeavors. It is vital to advancing a culture of fairness, trust, and respect. For more information, see the Thomas Jefferson University Academic Integrity policy and the Academic Integrity policy in the Jefferson College of Nursing Student Handbook & Course Catalog.`,
            netiquette: `Faculty and fellow students wish to foster a safe online learning environment consistent with Thomas Jefferson University’s Community Standards. In keeping with Thomas Jefferson University’s Commitment to Diversity, all opinions and experiences, no matter how different or controversial, must be respected in the tolerant spirit of academic discourse. Students are encouraged to comment, question, or critique an idea but are not to attack an individual.`,
            diversityInclusion: `Jefferson holds itself accountable to nurture an environment of inclusion and respect by valuing the uniqueness of every individual and celebrating and reflecting the rich diversity of its communities.`,
            chosenName: `Students may elect to have their chosen first name, gender identity, and pronoun appear in the Thomas Jefferson University system. See the policy at https://www.jefferson.edu/life-at-jefferson/handbooks/policies/graduate-policies/chosen-name.html.`,
            religiousObservance: `The University understands that some students may wish to observe religious holidays that fall on scheduled class days. See the Student Religious Observance policy at https://www.jefferson.edu/life-at-jefferson/handbooks/policies/graduate-policies/student-religious-observance-policy.html.`,
            academicSupport: `Student academic support sessions are facilitated by Jefferson College of Nursing faculty members and are available individually or as a group.`,
            disabilityDisclosure: `Accessibility Services complies with Section 504 and the ADA to provide reasonable accommodations to students eligible for such services. Students must initiate the process and provide documentation. For more information, visit https://www.jefferson.edu/life-at-jefferson/student-resources-services/academics-career-success/accessibility-services.html.`,
            informationTechnologies: `Analysts in Jefferson’s Information Systems and Technologies (IS&T) team are available to answer technology questions or issues.`,
            counselingServices: `The Student Counseling Center provides assistance in addressing personal challenges that interfere with academic progress and growth.`,
            titleIX: `The University’s Sex and Gender-Based Misconduct Policy sets forth Jefferson’s commitment to foster an environment free of discrimination, including sexual harassment and sexual violence.`,
            continuityInstruction: `For continuity of instruction during emergencies, refer to the policies in the Jefferson College of Nursing Student Handbook & Course Catalog.`
        },
        default: {
            generalPolicies: `BSN This course will abide by all Jefferson College of Nursing and Thomas Jefferson University policies. Students are responsible for knowing and adhering to University policies (https://www.jefferson.edu/academicpolicies) and policies as outlined in the Jefferson College of Nursing Student Handbook & Course Catalog.`,
            courseMinimumGrade: `A minimum grade of B- (80) is required in all BSN program courses to progress in the curriculum. Per program policy, only final grades will be rounded to the nearest whole number. Exam and quiz scores will not be rounded and will be entered in the grade book in Canvas to the nearest hundredth of a percent. For more information, see the Academic Progression policy in the Jefferson College of Nursing Student Handbook & Course Catalog.`,
            lateMakeupWork: `For the Jefferson College of Nursing policy on late and make-up work, see the Guidelines for Written Course Assignments section of the Jefferson College of Nursing Student Handbook & Course Catalog.`,
            attendance: `Attendance is expected in all classes for which a student is registered. Faculty, in conjunction with the academic program/department, determines attendance requirements for each course. See the Thomas Jefferson University Attendance policy and the Jefferson College of Nursing Student Handbook & Course Catalog for information regarding class, laboratory, and clinical attendance.`,
            incomplete: `Please refer to the Failure to Complete a Course and the Grading System policies in the Jefferson College of Nursing Student Handbook & Course Catalog.`,
            withdrawal: `See the Course Withdrawal policy in the Jefferson College of Nursing Student Handbook & Course Catalog. For withdrawal deadlines, refer to the appropriate Academic Calendar.`,
            academicRights: `The Academic Responsibility Contract in the Jefferson College of Nursing Student Handbook & Course Catalog contains information about Jefferson College of Nursing students’ academic rights and responsibilities. For more information, see the Thomas Jefferson University Rights and Responsibilities page.`,
            academicIntegrity: `Academic Integrity is the foundation of all Jefferson teaching, learning, and professional endeavors. It is vital to advancing a culture of fairness, trust, and respect. For more information, see the Thomas Jefferson University Academic Integrity policy and the Academic Integrity policy in the Jefferson College of Nursing Student Handbook & Course Catalog.`,
            netiquette: `Faculty and fellow students wish to foster a safe online learning environment consistent with Thomas Jefferson University’s Community Standards. In keeping with Thomas Jefferson University’s Commitment to Diversity, all opinions and experiences, no matter how different or controversial, must be respected in the tolerant spirit of academic discourse. Students are encouraged to comment, question, or critique an idea but are not to attack an individual.`,
            diversityInclusion: `Jefferson holds itself accountable to nurture an environment of inclusion and respect by valuing the uniqueness of every individual and celebrating and reflecting the rich diversity of its communities.`,
            chosenName: `Students may elect to have their chosen first name, gender identity, and pronoun appear in the Thomas Jefferson University system. See the policy at https://www.jefferson.edu/life-at-jefferson/handbooks/policies/graduate-policies/chosen-name.html.`,
            religiousObservance: `The University understands that some students may wish to observe religious holidays that fall on scheduled class days. See the Student Religious Observance policy at https://www.jefferson.edu/life-at-jefferson/handbooks/policies/graduate-policies/student-religious-observance-policy.html.`,
            academicSupport: `Student academic support sessions are facilitated by Jefferson College of Nursing faculty members and are available individually or as a group.`,
            disabilityDisclosure: `Accessibility Services complies with Section 504 and the ADA to provide reasonable accommodations to students eligible for such services. Students must initiate the process and provide documentation. For more information, visit https://www.jefferson.edu/life-at-jefferson/student-resources-services/academics-career-success/accessibility-services.html.`,
            informationTechnologies: `Analysts in Jefferson’s Information Systems and Technologies (IS&T) team are available to answer technology questions or issues.`,
            counselingServices: `The Student Counseling Center provides assistance in addressing personal challenges that interfere with academic progress and growth.`,
            titleIX: `The University’s Sex and Gender-Based Misconduct Policy sets forth Jefferson’s commitment to foster an environment free of discrimination, including sexual harassment and sexual violence.`,
            continuityInstruction: `For continuity of instruction during emergencies, refer to the policies in the Jefferson College of Nursing Student Handbook & Course Catalog.`
        }
    };

    return policies[program] || policies.default;
}


// Continue this pattern, incrementally integrating all sections...
/**
 * --- Event Listener Management ---
 * - Simplifies initialization of event listeners for elements.
 * - Refactors repetitive addEventListener calls into reusable functions.
 */

/**
 * Adds a change listener to the programSelect dropdown.
 * - Dynamically saves the selection to the server.
 */
function addProgramSelectListener() {
    const programSelect = document.getElementById('programSelect');
    if (programSelect) {
        programSelect.addEventListener('change', () => {
            saveProgramSelection();
        });
        console.log('Program select listener added.');
    } else {
        logMissingElement('programSelect');
    }
}

/**
 * Saves the selected program to the server.
 * - Refactored for modularity and improved error handling.
 */
export function saveProgramSelection(programSelectValue = null) {
    if (!programSelectValue) {
        const programSelectElement = document.getElementById('programSelect');
        if (!programSelectElement) {
            logMissingElement('programSelect');
            return;
        }
        programSelectValue = programSelectElement.value;
    }

    const syllabusId = new URLSearchParams(window.location.search).get('syllabusId');
    if (!syllabusId) {
        console.error('No syllabusId provided in URL.');
        return;
    }

    fetch(`/syllabus/update/${syllabusId}`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ programSelect: programSelectValue }),
    })
        .then((response) => {
            if (!response.ok) {
                throw new Error(`Failed to update program selection: ${response.statusText}`);
            }
            console.log('Program selection updated successfully.');
        })
        .catch((error) => {
            console.error('Error updating program selection:', error);
        });
}

// Fetch syllabus data to populate form (if editing an existing syllabus)
export async function initializeRetrieveSyllabusData(syllabusId) {
    try {
        const response = await fetch(`/syllabus/view/${syllabusId}?format=json`);
        if (response.ok) {
            const { syllabusData } = await response.json();
            console.log('Retrieved Syllabus Data:', syllabusData);

            // Populate Program Outcomes and SLOs
            if (syllabusData.programOutcomes) {
                console.log('Populating Program Outcomes and SLOs with data:', syllabusData.programOutcomes, syllabusData.slo || {});
                populateProgramAndSLOs(syllabusData.programOutcomes, syllabusData.slo || {});
            } else {
                console.warn('No Program Outcomes data found in retrieved syllabus data.');
            }

            // Populate Assignments
            if (syllabusData.assignments) {
                console.log('Populating Assignments with data:', syllabusData.assignments);
                populateAssignments(syllabusData.assignments);
            } else {
                console.warn('No Assignments data found in retrieved syllabus data.');
            }

            // Populate Weighting Details
            if (syllabusData.weightingDetails) {
                console.log('Populating Weighting Details with data:', syllabusData.weightingDetails);
                populateWeightingDetailsFromAssessments(syllabusData.assignments || []);
            } else {
                console.warn('No Weighting Details data found in retrieved syllabus data.');
            }

            // Populate Grading Elements
            if (syllabusData.assignments) {
                console.log('Populating Grading Elements from assignments:', syllabusData.assignments);
                populateGradingContainer(syllabusData.assignments);
            } else {
                console.warn('No data for Grading Elements found in retrieved syllabus data.');
            }

            // Populate the rest of the form
            populateForm(syllabusData);
        } else {
            throw new Error('Failed to fetch syllabus data');
        }
    } catch (error) {
        console.error('Error retrieving syllabus data:', error);
    }
}

/**
 * Initializes the event listener for the program select dropdown.
 */
export function initializeProgramSelectListener() {
    const programSelect = document.getElementById('programSelect');
    if (!programSelect) {
        console.warn('Program select element not found. Ensure the dropdown exists in the DOM.');
        return;
    }

    // Attach the event listener
    programSelect.addEventListener('change', event => {
        const selectedProgram = event.target?.value;
        if (!selectedProgram) {
            console.warn('No program selected or invalid value.');
            return;
        }

        console.log(`Program changed to: ${selectedProgram}`);
        handleProgramChange(event); // Call the handler for program changes
    });

    console.log('Program select listener initialized successfully.');
}

/**
 * --- Form Initialization ---
 * - Centralizes all form initialization logic.
 * - Refactored to use helper functions and reduce redundancy.
 */
export function initializeForm() {
    console.log('Initializing form...');

    const syllabusId = new URLSearchParams(window.location.search).get('syllabusId');
    if (syllabusId) {
        const syllabusIdElement = document.getElementById('syllabusId');
        if (syllabusIdElement) {
            syllabusIdElement.value = syllabusId;
        }
        initializeRetrieveSyllabusData(syllabusId);
    } else {
        console.warn('No syllabusId found in URL.');
    }

    const programSelect = document.getElementById('programSelect');
    if (programSelect) {
        programSelect.addEventListener('change', () => {
            handleProgramChange();
            saveFormAfterProgramChange();
        });
        console.log('Program select initialized.');
    } else {
        logMissingElement('programSelect');
    }

    loadSyllabusData()
        .then((syllabusData) => {
            console.log('Syllabus data loaded:', syllabusData);
            populateForm(syllabusData);
        })
        .catch((error) => {
            console.error('Error loading syllabus data:', error);
        });

    console.log('Form initialization complete.');
}

export function collectFormData() {
    const formData = {
        programSelect: getValueById('programSelect'),
        courseTitle: getValueById('courseTitle'),
        courseNumber: getValueById('courseNumber'),
        credits: getValueById('credits'),
        placement: getValueById('placement'),
        courseType: getValueById('courseType'),
        courseDelivery: getValueById('courseDelivery'),
        courseLead: getValueById('courseLead'),
        leadEmail: getValueById('leadEmail'),
        leadPhone: getValueById('leadPhone'),
        leadOffice: getValueById('leadOffice'),
        leadOfficeHours: getValueById('leadOfficeHours'),
        instructors: [], // Dynamically collected below.
        courseReqs: getValueById('courseReqs'),
        courseDescription: getValueById('courseDescription'),
        requiredMaterials: getValueById('requiredMaterials'),
        instructionalMethods: getValueById('instructionalMethods'),
        courseCommunications: getValueById('courseCommunications'),
        learningOutcomes: [], // Dynamically populated.
        assessments: [], // Dynamically populated.
        weightingDetails: [], // Dynamically populated.
        gradingElements: [], // Dynamically populated.
        modules: [], // Dynamically populated.
        slo: {}, // Dynamically populated.
        policiesAndServices: {}, // Dynamically populated below.
        programOutcomes: [], // Dynamically populated.
    };

    // Populate instructors
    const instructorContainer = document.querySelectorAll('#instructorsContainer > div');
    instructorContainer.forEach((instructorDiv, index) => {
        const instructor = {
            name: instructorDiv.querySelector(`[name="instructors[${index + 1}][name]"]`)?.value?.trim() || '',
            email: instructorDiv.querySelector(`[name="instructors[${index + 1}][email]"]`)?.value?.trim() || '',
            phone: instructorDiv.querySelector(`[name="instructors[${index + 1}][phone]"]`)?.value?.trim() || '',
            office: instructorDiv.querySelector(`[name="instructors[${index + 1}][office]"]`)?.value?.trim() || '',
            officeHours: instructorDiv.querySelector(`[name="instructors[${index + 1}][officeHours]"]`)?.value?.trim() || '',
        };

        // Log each instructor for debugging
        console.log(`Collected Instructor ${index + 1}:`, instructor);
        formData.instructors.push(instructor);
    });

    // Collect policies and services dynamically
    const policiesContainer = document.querySelectorAll('[data-policy-key]');
    policiesContainer.forEach(policy => {
        const key = policy.getAttribute('data-policy-key');
        const value = policy.value?.trim() || '';
        if (key) {
            formData.policiesAndServices[key] = value;
        }
    });

    console.log('Collected Policies and Services:', formData.policiesAndServices);

    // Log complete form data for debugging
    console.log('Complete Collected Form Data:', JSON.stringify(formData, null, 2));
    return formData;
}

/**
 * Sets default policy text for the selected program.
 * 
 * @param {string} program - The program selected (e.g., "BSN", "MSN", "DNP").
 */
export function setDefaultPolicyTextForProgram(program) {
    if (!program) {
        console.error('No program selected.');
        return;
    }

    // Complete default policies for all programs
    const defaultPolicies = {
        BSN: {
            generalPolicies: `BSN This course will abide by all Jefferson College of Nursing and Thomas Jefferson University policies. Students are responsible for knowing and adhering to University policies (https://www.jefferson.edu/academicpolicies) and policies as outlined in the Jefferson College of Nursing Student Handbook & Course Catalog.`,
            courseMinimumGrade: `A minimum grade of B- (80) is required in all MSN program courses in order to progress in the curriculum. Per program policy, only final grades will be rounded to the nearest whole number. Exam and quiz scores will not be rounded and will be entered in grade book in Canvas to the nearest hundredth of a percent.\nFor more information, please see the Academic Progression policy in the Jefferson College of Nursing Student Handbook & Course Catalog.`,
            lateMakeupWork: `For the Jefferson College of Nursing policy on late and make-up work, please see the Guidelines for Written Course Assignments section of the Jefferson College of Nursing Student Handbook & Course Catalog.`,
            attendance: `Attendance is expected in all classes for which a student is registered. Faculty, in conjunction with the academic program/department, determines attendance requirements for each course. Please see the Thomas Jefferson University Attendance policy and the Jefferson College of Nursing Student Handbook & Course Catalog for information regarding class, laboratory, and clinical attendance.`,
            incomplete: `Please refer to the Failure to Complete a Course and the Grading System policies in the Jefferson College of Nursing Student Handbook & Course Catalog.`,
            withdrawal: `Please see the Course Withdrawal policy in the Jefferson College of Nursing Student Handbook & Course Catalog.\nFor withdrawal deadlines, please refer to the appropriate Academic Calendar.`,
            academicRights: `The Academic Responsibility Contract in the Jefferson College of Nursing Student Handbook & Course Catalog contains information about Jefferson College of Nursing students’ academic rights and responsibilities.`,
            academicIntegrity: `Academic Integrity is the foundation of all Jefferson teaching, learning, and professional endeavors and is vital to advancing a culture of fairness, trust, and respect.`,
            netiquette: `Faculty and fellow students wish to foster a safe online learning environment consistent with Thomas Jefferson University’s Community Standards.`,
            diversityInclusion: `Jefferson holds itself accountable at every level of the organization to nurture an environment of inclusion and respect.`,
            chosenName: `Some members of our community use a name, gender, and pronoun other than their legal identifiers.`,
            religiousObservance: `The University understands that some students may wish to observe religious holidays that fall on scheduled class days.`,
            academicSupport: `Student academic support sessions are facilitated by Jefferson College of Nursing faculty members.`,
            disabilityDisclosure: `Accessibility Services complies with Section 504 and the ADA, providing reasonable accommodations to students who are eligible.`,
            informationTechnologies: `Analysts in Jefferson’s Information Systems and Technologies (IS&T) team are available to answer your technology questions or issues.`,
            counselingServices: `The Student Counseling Center provides assistance in addressing personal challenges that interfere with academic progress and growth.`,
            titleIX: `The University’s Sex and Gender-Based Misconduct Policy sets forth Jefferson’s commitment to foster an environment free of discrimination.`,
            continuityInstruction: `For information about continuity of instruction in the event of an emergency, please reference the Thomas Jefferson University Inclement Weather policy.`
        },
        MSN: {
            generalPolicies: `MSN This course will abide by all Jefferson College of Nursing and Thomas Jefferson University policies.`,
            courseMinimumGrade: `A minimum grade of B- (80) is required in all MSN program courses in order to progress in the curriculum.`,
            lateMakeupWork: `For the Jefferson College of Nursing policy on late and make-up work, please see the Guidelines for Written Course Assignments section.`,
            attendance: `Attendance is expected in all classes for which a student is registered.`,
            incomplete: `Please refer to the Failure to Complete a Course and the Grading System policies in the Jefferson College of Nursing Student Handbook.`,
            withdrawal: `Please see the Course Withdrawal policy in the Jefferson College of Nursing Student Handbook.`,
            academicRights: `The Academic Responsibility Contract in the Jefferson College of Nursing Student Handbook contains information about students’ academic rights.`,
            academicIntegrity: `Academic Integrity is the foundation of all Jefferson teaching, learning, and professional endeavors.`,
            netiquette: `Faculty and fellow students wish to foster a safe online learning environment.`,
            diversityInclusion: `Jefferson holds itself accountable to nurture an environment of inclusion and respect.`,
            chosenName: `Some members of our community use a name, gender, and pronoun other than their legal identifiers.`,
            religiousObservance: `The University understands that some students may wish to observe religious holidays.`,
            academicSupport: `Student academic support sessions are facilitated by Jefferson College of Nursing faculty members.`,
            disabilityDisclosure: `Accessibility Services complies with Section 504 and the ADA.`,
            informationTechnologies: `Analysts in Jefferson’s Information Systems and Technologies (IS&T) team are available to answer your technology questions.`,
            counselingServices: `The Student Counseling Center provides assistance in addressing personal challenges.`,
            titleIX: `The University’s Sex and Gender-Based Misconduct Policy sets forth Jefferson’s commitment to foster an environment free of discrimination.`,
            continuityInstruction: `For information about continuity of instruction in the event of an emergency, please reference the Jefferson policy.`
        },
        DNP: {
            generalPolicies: `DNP This course will abide by all Jefferson College of Nursing and Thomas Jefferson University policies.`,
            courseMinimumGrade: `A minimum grade of B- (80) is required in all DNP program courses in order to progress in the curriculum.`,
            lateMakeupWork: `For the Jefferson College of Nursing policy on late and make-up work, please see the Guidelines for Written Course Assignments section.`,
            attendance: `Attendance is expected in all classes for which a student is registered.`,
            incomplete: `Please refer to the Failure to Complete a Course and the Grading System policies in the Jefferson College of Nursing Student Handbook.`,
            withdrawal: `Please see the Course Withdrawal policy in the Jefferson College of Nursing Student Handbook.`,
            academicRights: `The Academic Responsibility Contract in the Jefferson College of Nursing Student Handbook contains information about students’ academic rights.`,
            academicIntegrity: `Academic Integrity is the foundation of all Jefferson teaching, learning, and professional endeavors.`,
            netiquette: `Faculty and fellow students wish to foster a safe online learning environment.`,
            diversityInclusion: `Jefferson holds itself accountable to nurture an environment of inclusion and respect.`,
            chosenName: `Some members of our community use a name, gender, and pronoun other than their legal identifiers.`,
            religiousObservance: `The University understands that some students may wish to observe religious holidays.`,
            academicSupport: `Student academic support sessions are facilitated by Jefferson College of Nursing faculty members.`,
            disabilityDisclosure: `Accessibility Services complies with Section 504 and the ADA.`,
            informationTechnologies: `Analysts in Jefferson’s Information Systems and Technologies (IS&T) team are available to answer your technology questions.`,
            counselingServices: `The Student Counseling Center provides assistance in addressing personal challenges.`,
            titleIX: `The University’s Sex and Gender-Based Misconduct Policy sets forth Jefferson’s commitment to foster an environment free of discrimination.`,
            continuityInstruction: `For information about continuity of instruction in the event of an emergency, please reference the Jefferson policy.`
        }
    };

    const policies = defaultPolicies[program] || {};
    console.log(`Setting default policies for program: ${program}`);

    for (const [policyKey, policyText] of Object.entries(policies)) {
        const editorContainer = document.querySelector(`#editor-${policyKey}`);
        const textarea = document.getElementById(policyKey);

        if (editorContainer && typeof Quill === 'function') {
            const quillInstance = Quill.find(editorContainer); // Assuming `Quill.find` locates an existing instance
            if (quillInstance) {
                quillInstance.setText(policyText); // Update Quill editor content
                console.log(`Updated Quill editor for "${policyKey}" with text: ${policyText}`);
            } else {
                console.warn(`No Quill instance found for "${policyKey}".`);
            }
        } else if (textarea) {
            // Fallback for non-Quill-managed elements
            textarea.value = policyText;
            console.log(`Setting value for element with id "${policyKey}" to: ${policyText}`);
        } else {
            console.warn(`Element with id or editor container "${policyKey}" not found.`);
        }
    }
    Object.entries(policies).forEach(([policyKey, policyText]) => {
        updatePolicyText(policyKey, policyText);
    });

    saveProgramSelection();
   
}

function updatePolicyText(policyKey, policyText) {
    const editorContainer = document.querySelector(`#editor-${policyKey}`);
    const textarea = document.getElementById(policyKey);

    if (editorContainer && typeof Quill === 'function') {
        const quillInstance = Quill.find(editorContainer);
        if (quillInstance) {
            quillInstance.setText(policyText);
            console.log(`Updated Quill editor for "${policyKey}" with text: ${policyText}`);
        } else {
            console.warn(`No Quill instance found for "${policyKey}".`);
        }
    } else if (textarea) {
        textarea.value = policyText;
        console.log(`Setting value for element with id "${policyKey}" to: ${policyText}`);
    } else {
        console.warn(`Element with id or editor container "${policyKey}" not found.`);
    }
}

/**
 * Handles the saving of the full form after a program selection change.
 * - Consolidates logic for saving form data to the server.
 */
export function saveFormAfterProgramChange() {
    const syllabusId = new URLSearchParams(window.location.search).get('syllabusId');
    if (!syllabusId) {
        console.error('No syllabusId provided in URL.');
        return;
    }

    const formData = collectFormData();
    fetch(`/syllabus/update/${syllabusId}`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ formData }),
    })
        .then((response) => {
            if (!response.ok) {
                throw new Error(`Failed to update form data: ${response.statusText}`);
            }
            console.log('Form data updated successfully.');
        })
        .catch((error) => {
            console.error('Error updating form data:', error);
        });
}

/**
 * --- Data Population ---
 * Populates form fields with data.
 * - Includes SLOs, assessments, policies, and more.
 */
export function populateForm(syllabusData) {
    console.log('Populating form with data:', syllabusData);

    const generalFields = [
        'programSelect',
        'courseTitle',
        'courseNumber',
        'credits',
        'placement',
        'courseType',
        'courseDelivery',
        'courseLead',
        'leadEmail',
        'leadPhone',
        'leadOffice',
        'leadOfficeHours',
        'courseReqs',
        'courseDescription',
        'requiredMaterials',
        'instructionalMethods',
        'courseCommunications',
    ];

    populateFields(generalFields, syllabusData);

    const policyFields = Object.keys(defaultPolicies.BSN);
    const policies = syllabusData.policiesAndServices || {};
    populateFields(policyFields, policies, defaultPolicies.BSN);

    // Populate Program Outcomes and SLOs
    if (syllabusData.programOutcomes) {
        console.log('Populating Program Outcomes and SLOs with data:', syllabusData.programOutcomes, syllabusData.slo || {});
        populateProgramAndSLOs(syllabusData.programOutcomes, syllabusData.slo || {});
    } else {
        console.warn('No Program Outcomes data found in retrieved syllabus data.');
    }

    // Populate Instructors
    if (syllabusData.instructors && typeof populateInstructors === 'function') {
        populateInstructors(syllabusData.instructors);
    }

    // Populate Learning Outcomes (legacy or additional)
    if (syllabusData.learningOutcomes && typeof populateLearningOutcomes === 'function') {
        populateLearningOutcomes(syllabusData.learningOutcomes);
    }

    // Populate Weighting Details
    if (syllabusData.weightingDetails && typeof populateWeightingDetails === 'function') {
        populateWeightingDetails(syllabusData.weightingDetails);
    }

    console.log('Form population complete.');
}

/**
* --- SLO (Student Learning Outcomes) Management ---
* Populates Program Outcomes and Student Learning Outcomes.
* Includes modular functions for handling dynamic inputs and error checks.
*/
export function populateProgramAndSLOs(program) {
    const programData = programOutcomes[program];
    const sloData = sloMapping[program];

    const progOutcomesTable = document.querySelector('#progStudentOutcomesTable tbody');

    if (!progOutcomesTable) {
        console.error('Program Outcomes Table not found.');
        return;
    }

    progOutcomesTable.innerHTML = ''; // Clear existing table rows

    if (programData && sloData) {
        programData.forEach((outcome, index) => {
            const row = document.createElement('tr');

            // Program Outcome Column
            const progCell = document.createElement('td');
            progCell.innerHTML = `<ol start="${index + 1}"><li>${outcome}</li></ol>`;
            row.appendChild(progCell);

            // SLO Column
            const sloCell = document.createElement('td');
            sloCell.className = 'slo-cell';
            sloCell.setAttribute('data-slo-index', index + 1);

            // Populate SLO inputs if they exist
            if (sloData[index] && sloData[index].length) {
                sloData[index].forEach((slo, i) => {
                    const outcomeWrapper = document.createElement('div');
                    outcomeWrapper.className = 'outcome-wrapper';

                    const input = document.createElement('textarea');
                    input.name = `slo${index + 1}[]`;
                    input.value = slo;
                    input.placeholder = `SLO ${index + 1}.${i + 1}`; // Use the correct placeholder
                    input.required = true;

                    const removeButton = document.createElement('button');
                    removeButton.type = 'button';
                    removeButton.className = 'removeOutcomeButton';
                    removeButton.textContent = 'Remove';
                    removeButton.addEventListener('click', () => {
                        outcomeWrapper.remove();
                        relocateAddButton(sloCell); // Ensure the Add button is repositioned
                        updateLearningOutcomesAndAssessments(); // Update assessments dynamically
                    });

                    outcomeWrapper.appendChild(input);
                    outcomeWrapper.appendChild(removeButton);
                    sloCell.appendChild(outcomeWrapper);
                });
            }

            // Add Outcome Button
            const addButton = document.createElement('button');
            addButton.type = 'button';
            addButton.className = 'addOutcomeButton';
            addButton.textContent = 'Add';
            addButton.addEventListener('click', () => {
                addSLOInput(sloCell, index + 1); // Correctly add a new SLO
                updateLearningOutcomesAndAssessments(); // Update assessments dynamically
            });
            sloCell.appendChild(addButton);

            row.appendChild(sloCell);
            progOutcomesTable.appendChild(row);
        });
    } else {
        console.warn('No Program Outcomes or SLO data found for the selected program.');
    }

    // Reinitialize SLO Listeners to ensure correct event handling
    initializeSLOListeners();

    // Update Learning Outcomes and Assessments Table
    updateLearningOutcomesAndAssessments();
}

/**
 * Creates a group containing an SLO input field and a "Remove" button.
 * @param {number} outcomeIndex - The Program Outcome index.
 * @param {number} sloIndex - The SLO index.
 * @param {string} value - The initial value of the SLO input.
 * @returns {HTMLElement} - A div containing the input and buttons.
 */
function createSLOGroup(outcomeIndex, sloIndex, value) {
    const groupDiv = document.createElement('div');
    groupDiv.className = 'outcome-wrapper';

    // Create the SLO input field
    const input = createSLOInput(outcomeIndex, sloIndex, value);
    groupDiv.appendChild(input);

    // Create the "Remove" button
    const removeButton = document.createElement('button');
    removeButton.type = 'button';
    removeButton.className = 'removeOutcomeButton';
    removeButton.textContent = 'Remove';
    removeButton.addEventListener('click', () => {
        groupDiv.remove();
        const sloCell = input.closest('.slo-cell');
        if (sloCell) {
            relocateAddButton(sloCell);
        }
    });

    groupDiv.appendChild(removeButton);
    return groupDiv;
}

export function addSLOInput(sloCell, outcomeIndex, sloIndex, value = '') {
    // Prevent duplicates by checking if this placeholder already exists
    const existingPlaceholders = Array.from(sloCell.querySelectorAll('textarea')).map(input => input.placeholder);
    const newPlaceholder = `SLO ${outcomeIndex}.${sloIndex}`;
    if (existingPlaceholders.includes(newPlaceholder)) {
        console.warn(`SLO with placeholder "${newPlaceholder}" already exists.`);
        return;
    }

    const groupDiv = document.createElement('div');
    groupDiv.className = 'slo-group';

    const input = document.createElement('textarea');
    input.name = `slo${outcomeIndex}[]`;
    input.placeholder = newPlaceholder;
    input.value = value;
    input.required = true;

    const removeButton = document.createElement('button');
    removeButton.type = 'button';
    removeButton.className = 'removeOutcomeButton';
    removeButton.textContent = 'Remove';
    removeButton.addEventListener('click', () => {
        groupDiv.remove();
        console.log(`Removed SLO: ${newPlaceholder}`);
    });

    groupDiv.appendChild(input);
    groupDiv.appendChild(removeButton);

    const addButton = sloCell.querySelector('.addOutcomeButton');
    sloCell.insertBefore(groupDiv, addButton); // Ensure the "Add" button remains at the end
}

/**
 * Creates an input element for an SLO field.
 */
function createSLOInput(outcomeIndex, sloIndex, value = '') {
    const input = document.createElement('textarea');
    input.name = `slo${outcomeIndex}[]`;
    input.placeholder = `SLO ${outcomeIndex}.${sloIndex}`;
    input.value = value;
    input.required = true;
    return input;
}

/**
 * Moves the "Add Outcome" button to the end of the SLO cell.
 * @param {HTMLElement} sloCell - The SLO cell containing the Add button.
 */
export function relocateAddButton(sloCell) {
    const addButton = sloCell.querySelector('.addOutcomeButton');
    if (addButton) {
        sloCell.appendChild(addButton); // Always move the Add button to the end
    }
}

/**
 * --- Assessment Management ---
 * Refactored to dynamically populate and update assessment data.
 * - Introduces reusable helper functions for creating and managing assessments.
 */

// Populates the Assessments table based on syllabus data.
export function populateAssessments(assessments) {
    const outcomesTableBody = document.querySelector('#outcomesAssessmentTable tbody');
    outcomesTableBody.innerHTML = '';

    if (!assessments || !Array.isArray(assessments)) {
        console.warn('No assessments provided or invalid format.');
        return;
    }

    assessments.forEach((assessment, index) => {
        const row = document.createElement('tr');

        // Outcome description cell
        const outcomeCell = document.createElement('td');
        outcomeCell.textContent = assessment.description || `Learning Outcome ${index + 1}`;
        row.appendChild(outcomeCell);

        // Assessment input cell
        const assessmentCell = document.createElement('td');
        const inputWrapper = document.createElement('div');
        inputWrapper.className = 'assessment-input-wrapper';

        const assessmentInput = document.createElement('input');
        assessmentInput.type = 'text';
        assessmentInput.name = `assessments[${index}]`;
        assessmentInput.placeholder = `Assessment ${index + 1}`;
        assessmentInput.value = assessment.detail || '';
        inputWrapper.appendChild(assessmentInput);

        assessmentCell.appendChild(inputWrapper);
        row.appendChild(assessmentCell);

        outcomesTableBody.appendChild(row);
    });
}

/**
 * Updates the Assessments table dynamically.
 * - Allows users to add/remove assessments and links changes to SLOs.
 */
export function updateAssessments(syllabusData = {}) {
    console.log('Updating Assessments...', syllabusData);

    const outcomesTable = document.querySelector('#outcomesAssessmentTable tbody');
    outcomesTable.innerHTML = ''; // Clear existing rows

    const sloCells = document.querySelectorAll('.slo-cell');
    sloCells.forEach((sloCell, index) => {
        const row = document.createElement('tr');

        // Outcome description
        const outcomeCell = document.createElement('td');
        outcomeCell.textContent = `Learning Outcome ${index + 1}`;
        row.appendChild(outcomeCell);

        // Assessment inputs
        const assessmentCell = document.createElement('td');
        const assessments = syllabusData.assessments || [];
        const assessmentDetail = assessments[index] || { detail: '' };

        const inputWrapper = document.createElement('div');
        inputWrapper.className = 'assessment-input-wrapper';

        const assessmentInput = document.createElement('input');
        assessmentInput.type = 'text';
        assessmentInput.name = `assessments[${index}]`;
        assessmentInput.placeholder = `Assessment ${index + 1}`;
        assessmentInput.value = assessmentDetail.detail;
        inputWrapper.appendChild(assessmentInput);

        assessmentCell.appendChild(inputWrapper);
        row.appendChild(assessmentCell);

        outcomesTable.appendChild(row);
    });
}

export function updateWeightingDetailsAndAssignments(syllabusData = {}) {
    console.log("Updating Weighting Details and Assignments with syllabusData:", syllabusData);

    const weightingDetailsTableBody = document.querySelector('#weightingDetailsTable tbody');
    const outcomesTable = document.getElementById('outcomesAssessmentTable');

    if (!weightingDetailsTableBody) {
        console.warn("Weighting details table body not found. Skipping update.");
        return;
    }

    if (!outcomesTable) {
        console.warn("Outcomes assessment table not found. Skipping update.");
        return;
    }

    const existingWeightDetails = {}; // Store the existing weight details

    // Extract existing weights before clearing the table
    weightingDetailsTableBody.querySelectorAll('tr').forEach((row, index) => {
        const assessedElementInput = row.querySelector('input[name="assessedElement"]');
        const weightInput = row.querySelector('input[name="weight"]');
        if (assessedElementInput && weightInput) {
            existingWeightDetails[index] = {
                assessedElement: assessedElementInput.value,
                weight: weightInput.value
            };
        }
    });

    weightingDetailsTableBody.innerHTML = ''; // Clear existing rows to repopulate everything

    // Pull data from outcomesAssessmentTable
    const assessmentsData = syllabusData.weightingDetails || {};
    const assessmentsFromOutcomes = [];

    outcomesTable.querySelectorAll('tr').forEach((row, index) => {
        const assessmentCell = row.querySelector('.assessment-cell');
        if (assessmentCell) {
            const assessmentInputs = assessmentCell.querySelectorAll('input');
            assessmentInputs.forEach(input => {
                if (input.value.trim() !== '') {
                    assessmentsFromOutcomes.push({
                        assessedElement: input.value.trim(),
                        weight: assessmentsData[`weight${index + 1}`] || '' // Use syllabus data weight if available
                    });
                }
            });
        }
    });

    // Populate the table with combined data
    const combinedWeightDetails = [...assessmentsFromOutcomes];

    combinedWeightDetails.forEach((details, index) => {
        const newRow = document.createElement('tr');
        newRow.className = 'weighting-detail-row';

        // Assessed Element Cell
        const assessedElementCell = document.createElement('td');
        const assessedElementInput = document.createElement('input');
        assessedElementInput.type = 'text';
        assessedElementInput.name = 'assessedElement';
        assessedElementInput.placeholder = 'Assessed Element';
        assessedElementInput.value = details.assessedElement || '';
        assessedElementInput.required = true;
        assessedElementCell.appendChild(assessedElementInput);
        newRow.appendChild(assessedElementCell);

        // Weight Cell
        const weightCell = document.createElement('td');
        const weightInput = document.createElement('input');
        weightInput.type = 'number';
        weightInput.name = 'weight';
        weightInput.placeholder = '%';
        weightInput.value = details.weight || '';
        weightInput.required = true;
        weightInput.addEventListener('input', updateTotalWeight); // Update total weight on change
        weightCell.appendChild(weightInput);
        newRow.appendChild(weightCell);

        // Append row to table body
        weightingDetailsTableBody.appendChild(newRow);
    });

    // Add a blank row if no data exists
    if (combinedWeightDetails.length === 0) {
        const newRow = document.createElement('tr');
        newRow.className = 'weighting-detail-row';

        // Create assessed element input cell
        const assessedElementCell = document.createElement('td');
        const assessedElementInput = document.createElement('input');
        assessedElementInput.type = 'text';
        assessedElementInput.name = 'assessedElement';
        assessedElementInput.placeholder = 'Assessed Element';
        assessedElementInput.required = true;
        assessedElementCell.appendChild(assessedElementInput);
        newRow.appendChild(assessedElementCell);

        // Create weight input cell
        const weightCell = document.createElement('td');
        const weightInput = document.createElement('input');
        weightInput.type = 'number';
        weightInput.name = 'weight';
        weightInput.placeholder = '%';
        weightInput.required = true;
        weightInput.addEventListener('input', updateTotalWeight);
        weightCell.appendChild(weightInput);
        newRow.appendChild(weightCell);

        // Append row to table body
        weightingDetailsTableBody.appendChild(newRow);
    }

    updateTotalWeight(); // Update total weight calculation
}

/**
 * --- Module Management ---
 * Handles the dynamic population and updating of module-related data.
 */

export function populateModules(modules, updateAssignments = true) {
    console.log('Populating modules...', modules);

    const modulesContainer = document.getElementById('modulesContainer');
    modulesContainer.innerHTML = ''; // Clear existing content

    if (!modules || !Array.isArray(modules)) {
        console.warn('No modules provided or invalid format.');
        return;
    }

    const assignments = []; // Collect assignments from modules

    modules.forEach((module, index) => {
        const moduleBlock = document.createElement('div');
        moduleBlock.className = 'module-block';
        moduleBlock.id = `module${index + 1}`;

        // Title Input
        const titleInput = document.createElement('input');
        titleInput.type = 'text';
        titleInput.id = `module${index + 1}Title`;
        titleInput.name = `module${index + 1}[title]`;
        titleInput.placeholder = `Module ${index + 1} Title`;
        titleInput.value = module.title || '';
        moduleBlock.appendChild(titleInput);

        // Dates Input
        const datesInput = document.createElement('input');
        datesInput.type = 'text';
        datesInput.id = `module${index + 1}Dates`;
        datesInput.name = `module${index + 1}[dates]`;
        datesInput.placeholder = `Module ${index + 1} Dates`;
        datesInput.value = module.dates || '';
        moduleBlock.appendChild(datesInput);

        // Assignments
        const assignmentsContainer = document.createElement('div');
        assignmentsContainer.className = 'assignment-container';

        module.assignments?.forEach((assignment, assignmentIndex) => {
            const assignmentInput = document.createElement('input');
            assignmentInput.type = 'text';
            assignmentInput.name = `module${index + 1}[assignments][]`;
            assignmentInput.placeholder = `Assignment ${assignmentIndex + 1}`;
            assignmentInput.value = assignment;
            assignmentsContainer.appendChild(assignmentInput);

            // Collect assignments for updating assignmentsContainer
            assignments.push({
                title: assignment,
                description: '', // Placeholder for description
            });
        });

        moduleBlock.appendChild(assignmentsContainer);
        modulesContainer.appendChild(moduleBlock);
    });

    // Populate assignmentsContainer if updateAssignments is true
    if (updateAssignments && assignments.length > 0) {
        populateAssignments(assignments);
    }
}

export function populateAssignmentAndGradingElements(assignments) {
    console.log('Populating Assignments and Grading Elements...', assignments);

    const assignmentsContainer = document.getElementById('assignmentsContainer');
    const gradingContainer = document.getElementById('gradingContainer');

    assignmentsContainer.innerHTML = ''; // Clear existing content
    gradingContainer.innerHTML = ''; // Clear existing content

    if (!assignments || !Array.isArray(assignments)) {
        console.warn('No assignments provided or invalid format.');
        return;
    }

    assignments.forEach((assignment, index) => {
        // Populate Assignments Container
        const assignmentDiv = document.createElement('div');
        assignmentDiv.className = 'assignment-block';

        const titleInput = document.createElement('input');
        titleInput.type = 'text';
        titleInput.name = `assignment[${index}][title]`;
        titleInput.placeholder = `Assignment ${index + 1} Title`;
        titleInput.value = assignment.title || '';
        titleInput.required = true;
        assignmentDiv.appendChild(titleInput);

        const descriptionInput = document.createElement('textarea');
        descriptionInput.name = `assignment[${index}][description]`;
        descriptionInput.placeholder = `Assignment ${index + 1} Description`;
        descriptionInput.value = assignment.description || '';
        descriptionInput.required = true;
        assignmentDiv.appendChild(descriptionInput);

        assignmentsContainer.appendChild(assignmentDiv);

        // Populate Grading Container
        const gradingDiv = document.createElement('div');
        gradingDiv.className = 'grading-block';

        const gradingTitleInput = document.createElement('textarea');
        gradingTitleInput.name = `grading[${index}][title]`;
        gradingTitleInput.placeholder = `Grading Element ${index + 1} Title`;
        gradingTitleInput.value = assignment.title || '';
        gradingTitleInput.required = true;
        gradingDiv.appendChild(gradingTitleInput);

        const gradingDescriptionInput = document.createElement('textarea');
        gradingDescriptionInput.name = `grading[${index}][description]`;
        gradingDescriptionInput.placeholder = `Grading Element ${index + 1} Description`;
        gradingDescriptionInput.value = assignment.description || '';
        gradingDescriptionInput.required = true;
        gradingDiv.appendChild(gradingDescriptionInput);

        gradingContainer.appendChild(gradingDiv);
    });
}

export function populateGradingContainer(assignments) {
    const gradingContainer = document.getElementById('gradingContainer');
    gradingContainer.innerHTML = ''; // Clear existing content

    if (!assignments || !Array.isArray(assignments)) {
        console.warn('No assignments provided for grading container.');
        return;
    }

    assignments.forEach((assignment, index) => {
        const gradingDiv = document.createElement('div');
        gradingDiv.className = 'grading-block';

        // Title Input
        const gradingTitleInput = document.createElement('textarea');
        gradingTitleInput.name = `grading[${index}][title]`;
        gradingTitleInput.placeholder = `Grading Element ${index + 1} Title`;
        gradingTitleInput.value = assignment.title || '';
        gradingTitleInput.required = true;
        gradingDiv.appendChild(gradingTitleInput);

        // Description Input
        const gradingDescriptionInput = document.createElement('textarea');
        gradingDescriptionInput.name = `grading[${index}][description]`;
        gradingDescriptionInput.placeholder = `Grading Element ${index + 1} Description`;
        gradingDescriptionInput.value = assignment.description || '';
        gradingDescriptionInput.required = true;
        gradingDiv.appendChild(gradingDescriptionInput);

        gradingContainer.appendChild(gradingDiv);
    });
}

/**
 * --- Policies and Services ---
 * Refactored to dynamically populate policy sections based on program and syllabus data.
 * - Modularized to handle defaults and program-specific policies.
 */

// Populates Policies and Services fields
export function populatePolicies(syllabusData, program) {
    console.log('Populating Policies and Services...', { syllabusData, program });

    const policies = syllabusData.policiesAndServices || {};
    const defaultPoliciesForProgram = defaultPolicies[program] || defaultPolicies.BSN;

    const policyFields = [
        'generalPolicies',
        'courseMinimumGrade',
        'lateMakeupWork',
        'attendance',
        'incomplete',
        'withdrawal',
        'academicRights',
        'academicIntegrity',
        'netiquette',
        'diversityInclusion',
        'chosenName',
        'religiousObservance',
        'academicSupport',
        'disabilityDisclosure',
        'informationTechnologies',
        'counselingServices',
        'titleIX',
        'continuityInstruction'
    ];

    policyFields.forEach((policy) => {
        const value = policies[policy] ?? defaultPoliciesForProgram[policy] ?? '';
        setElementValue(policy, value); // Uses the utility function to set values dynamically
    });
}
/**
 * --- Grading Elements ---
 * Dynamically handles grading elements, including title and description for each.
 * - Modularized for better scalability.
 */

// Populates Grading Elements dynamically
export function populateGradingElements(gradingElements) {
    console.log('Populating Grading Elements...', gradingElements);

    const gradingContainer = document.getElementById('gradingContainer');
    gradingContainer.innerHTML = ''; // Clear existing content

    if (!gradingElements || !Array.isArray(gradingElements)) {
        console.warn('No grading elements provided or invalid format.');
        return;
    }

    gradingElements.forEach((element, index) => {
        const gradingBlock = document.createElement('div');
        gradingBlock.className = 'grading-block';

        // Title Input
        const titleLabel = document.createElement('label');
        titleLabel.textContent = `Grading Element Title ${index + 1}:`;
        const titleInput = document.createElement('input');
        titleInput.type = 'text';
        titleInput.name = `gradingElements[${index}][title]`;
        titleInput.value = element.title || '';
        titleInput.required = true;

        gradingBlock.appendChild(titleLabel);
        gradingBlock.appendChild(titleInput);

        // Description Textarea
        const descriptionLabel = document.createElement('label');
        descriptionLabel.textContent = `Grading Element Description ${index + 1}:`;
        const descriptionInput = document.createElement('textarea');
        descriptionInput.name = `gradingElements[${index}][description]`;
        descriptionInput.value = element.description || '';
        descriptionInput.required = true;

        gradingBlock.appendChild(descriptionLabel);
        gradingBlock.appendChild(descriptionInput);

        gradingContainer.appendChild(gradingBlock);
    });
}
/**
 * --- Weighting Details ---
 * Handles dynamic population and validation of weighting details.
 * - Updates total weight on input changes.
 */

// Populates Weighting Details
export function populateWeightingDetailsFromAssessments(assignments) {
    const weightingDetailsTableBody = document.querySelector('#weightingDetailsTable tbody');
    weightingDetailsTableBody.innerHTML = ''; // Clear existing rows

    if (!assignments || !Array.isArray(assignments)) {
        console.warn('No assignments provided for weighting details.');
        return;
    }

    assignments.forEach((assignment, index) => {
        const newRow = document.createElement('tr');
        newRow.className = 'weighting-detail-row';

        // Assessed Element Cell
        const assessedElementCell = document.createElement('td');
        const assessedElementInput = document.createElement('input');
        assessedElementInput.type = 'text';
        assessedElementInput.name = `weighting[${index}][assessedElement]`;
        assessedElementInput.placeholder = 'Assessed Element';
        assessedElementInput.value = assignment.title || '';
        assessedElementInput.required = true;
        assessedElementCell.appendChild(assessedElementInput);
        newRow.appendChild(assessedElementCell);

        // Weight Cell
        const weightCell = document.createElement('td');
        const weightInput = document.createElement('input');
        weightInput.type = 'number';
        weightInput.name = `weighting[${index}][weight]`;
        weightInput.placeholder = '%';
        weightInput.value = ''; // Weight should be input by the user
        weightInput.required = true;
        weightInput.addEventListener('input', updateTotalWeight); // Update total weight dynamically
        weightCell.appendChild(weightInput);
        newRow.appendChild(weightCell);

        weightingDetailsTableBody.appendChild(newRow);
    });

    // Ensure total weight is updated
    updateTotalWeight();
}


// Updates and validates the total weight
function updateTotalWeight() {
    const weightInputs = document.querySelectorAll('input[name^="weight"]');
    let totalWeight = 0;

    weightInputs.forEach((input) => {
        const value = parseFloat(input.value) || 0;
        totalWeight += value;
    });

    const totalWeightElement = document.getElementById('totalWeight');
    if (totalWeightElement) {
        totalWeightElement.textContent = `${totalWeight}%`; // Display the total weight
        totalWeightElement.style.color = totalWeight > 100 ? 'red' : ''; // Highlight in red if over 100%
    }

    if (totalWeight > 100) {
        console.warn('Total weight exceeds 100%. Adjust the weights.');
    }
}
/**
 * --- Instructors ---
 * Dynamically populates instructor data and initializes Quill editors for office hours.
 */
let instructorsPopulated = false;
// Populates Instructor Data
// Populates Instructor Data
export function populateInstructors(instructors) {
    console.log('Populating Instructors...', instructors);

    const instructorsContainer = document.getElementById('instructorsContainer');
    if (!instructorsContainer) {
        console.error('Instructors container not found.');
        return;
    }

    instructorsContainer.innerHTML = ''; // Clear existing content

    if (!instructors || !Array.isArray(instructors)) {
        console.warn('No instructors provided or invalid format.');
        return;
    }

    instructors.forEach((instructor, index) => {
        const editorId = `instructor${index + 1}OfficeHours`;

        // Destroy existing Quill editor if it exists
        destroyQuillEditor(editorId);

        const instructorDiv = document.createElement('div');
        instructorDiv.className = (index + 1) % 2 === 0 ? 'instructor-block-white' : 'instructor-block-gray';

        // Construct instructor HTML dynamically
        const instructorHTML = `
            <label for="instructor${index + 1}Name">Course Instructor ${index + 1}:</label>
            <input type="text" id="instructor${index + 1}Name" name="instructors[${index + 1}][name]" placeholder="Instructor Name" value="${instructor.name || ''}" required>
            <label for="instructor${index + 1}Email">Email:</label>
            <input type="email" id="instructor${index + 1}Email" name="instructors[${index + 1}][email]" placeholder="name@jefferson.edu" value="${instructor.email || ''}" required>
            <label for="instructor${index + 1}Phone">Phone:</label>
            <input type="tel" id="instructor${index + 1}Phone" name="instructors[${index + 1}][phone]" placeholder="###-###-####" value="${instructor.phone || ''}" required>
            <label for="instructor${index + 1}Office">Office:</label>
            <input type="text" id="instructor${index + 1}Office" name="instructors[${index + 1}][office]" placeholder="Office Location" value="${instructor.office || ''}" required>
            <label for="instructor${index + 1}OfficeHours">Office Hours:</label>
            <div id="editor-${editorId}" style="height: 100px;"></div>
            <textarea id="${editorId}" name="instructors[${index + 1}][officeHours]" style="display: none;">${instructor.officeHours || ''}</textarea>
        `;

        instructorDiv.innerHTML = instructorHTML;
        instructorsContainer.appendChild(instructorDiv);

        console.log(`Initializing Quill editor for: editor-${editorId}`);

        // Initialize Quill editor for office hours
        initializeQuillEditor(editorId, {
            theme: 'snow',
            placeholder: 'Enter text...',
            modules: { toolbar: [['bold', 'italic', 'underline', 'strike'], ['link'], ['clean']] }
        });
    });
}

// Function to populate the "Additional Course Instructors" dropdown
function populateAddInstructorsDropdown() {
    const addInstructorsDropdown = document.getElementById('addInstructors');
    if (!addInstructorsDropdown) {
        console.error('Dropdown element #addInstructors not found.');
        return;
    }

    // Clear any existing options
    addInstructorsDropdown.innerHTML = '<option value="">Select number of instructors</option>';

    // Populate dropdown with options (1 to 5 additional instructors)
    const maxInstructors = 9; // You can adjust this as needed
    for (let i = 1; i <= maxInstructors; i++) {
        const option = document.createElement('option');
        option.value = i;
        option.textContent = i === 1 ? `${i} Instructor` : `${i} Instructors`;
        addInstructorsDropdown.appendChild(option);
    }

    console.log('Dropdown populated with instructor options.');
}

// Call this function during initialization
document.addEventListener('DOMContentLoaded', () => {
    populateAddInstructorsDropdown();
});

// Populates Assignments
/**
 * --- Assignments ---
 * Dynamically populates assignments and updates the UI accordingly.
 */
export function populateAssignments(assignments) {
    console.log('Populating Assignments...', assignments);

    const assignmentsContainer = document.getElementById('assignmentsContainer');
    assignmentsContainer.innerHTML = ''; // Clear existing assignments

    if (!assignments || !Array.isArray(assignments)) {
        console.warn('No assignments provided or invalid format.');
        return;
    }

    assignments.forEach((assignment, index) => {
        const assignmentDiv = document.createElement('div');
        assignmentDiv.className = 'assignment-block';

        // Title Input
        const titleInput = document.createElement('input');
        titleInput.type = 'text';
        titleInput.name = `assignment[${index}][title]`;
        titleInput.placeholder = `Assignment ${index + 1} Title`;
        titleInput.value = assignment.title || '';
        titleInput.required = true;
        assignmentDiv.appendChild(titleInput);

        // Description Input
        const descriptionInput = document.createElement('textarea');
        descriptionInput.name = `assignment[${index}][description]`;
        descriptionInput.placeholder = `Assignment ${index + 1} Description`;
        descriptionInput.value = assignment.description || '';
        descriptionInput.required = true;
        assignmentDiv.appendChild(descriptionInput);

        assignmentsContainer.appendChild(assignmentDiv);
    });

    // Update related elements after populating assignments
    populateGradingContainer(assignments);
    populateWeightingDetailsFromAssessments(assignments);
}


// Dynamically creates an input wrapper for assessments
function createAssessmentInputWrapper(index) {
    const inputWrapper = document.createElement('div');
    inputWrapper.className = 'assessment-input-wrapper';

    const assessmentInput = document.createElement('input');
    assessmentInput.type = 'text';
    assessmentInput.name = `assessments[${index}]`;
    assessmentInput.placeholder = `Assessment ${index}`;
    assessmentInput.required = true;

    inputWrapper.appendChild(assessmentInput);
    return inputWrapper;
}
/**
 * --- Learning Outcomes ---
 * Populates and manages learning outcomes and their corresponding assessments.
 */

// Populates Learning Outcomes
export function populateLearningOutcomes(learningOutcomes) {
    console.log('Populating Learning Outcomes...', learningOutcomes);

    const outcomesTableBody = document.getElementById('outcomesAssessmentTable').getElementsByTagName('tbody')[0];
    outcomesTableBody.innerHTML = ''; // Clear existing rows

    if (!learningOutcomes || !Array.isArray(learningOutcomes)) {
        console.warn('No learning outcomes provided or invalid format.');
        return;
    }

    learningOutcomes.forEach((outcome, index) => {
        const row = document.createElement('tr');
        row.setAttribute('data-outcome-index', index);

        // Outcome Cell
        const outcomeCell = document.createElement('td');
        outcomeCell.textContent = outcome;
        row.appendChild(outcomeCell);

        // Assessment Cell
        const assessmentCell = document.createElement('td');
        assessmentCell.className = 'assessment-cell';

        const inputWrapper = createAssessmentInputWrapper(index + 1);
        assessmentCell.appendChild(inputWrapper);

        const addButton = createAddAssessmentButton(assessmentCell, index + 1);
        assessmentCell.appendChild(addButton);

        row.appendChild(assessmentCell);
        outcomesTableBody.appendChild(row);
    });
}

// Sends form data to the server
export function submitFormData() {
    const formData = collectFormData();
    const syllabusId = new URLSearchParams(window.location.search).get('syllabusId');

    if (!syllabusId) {
        console.error('No syllabusId provided in URL.');
        return;
    }

    fetch(`/syllabus/update/${syllabusId}`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ formData }),
    })
        .then((response) => {
            if (!response.ok) {
                throw new Error(`Failed to update form data: ${response.statusText}`);
            }
            console.log('Form data updated successfully.');
        })
        .catch((error) => {
            console.error('Error updating form data:', error);
        });
}
/**
 * --- Data Collection Helpers ---
 * Utility functions for gathering specific form sections.
 */

// Collects learning outcomes from the form
function collectLearningOutcomes() {
    const outcomes = [];
    const inputs = document.querySelectorAll('input[name="learningOutcomes[]"]');
    inputs.forEach((input) => {
        if (input.value.trim() !== '') outcomes.push(input.value.trim());
    });
    return outcomes;
}

// Collects assessments
function collectAssessments() {
    const assessments = [];
    const rows = document.querySelectorAll('#outcomesAssessmentTable tbody tr');
    rows.forEach((row) => {
        const assessmentInput = row.querySelector('input[name^="assessments"]');
        const descriptionCell = row.querySelector('td:first-child');
        if (assessmentInput && descriptionCell) {
            assessments.push({
                detail: assessmentInput.value.trim(),
                description: descriptionCell.textContent.trim(),
            });
        }
    });
    return assessments;
}

// Collects weighting details
function collectWeightingDetails() {
    const details = [];
    const rows = document.querySelectorAll('#weightingDetailsTable tbody tr');
    rows.forEach((row) => {
        const elementInput = row.querySelector('input[name^="assessedElement"]');
        const weightInput = row.querySelector('input[name^="weight"]');
        if (elementInput && weightInput) {
            details.push({
                element: elementInput.value.trim(),
                weight: weightInput.value.trim(),
            });
        }
    });
    return details;
}

// Collects modules
function collectModules() {
    const modules = [];
    const blocks = document.querySelectorAll('.module-block');
    blocks.forEach((block) => {
        const titleInput = block.querySelector('input[name$="[title]"]');
        const datesInput = block.querySelector('input[name$="[dates]"]');
        const assignments = [];
        const assignmentInputs = block.querySelectorAll('input[name$="[assignments][]"]');
        assignmentInputs.forEach((input) => assignments.push(input.value.trim()));
        if (titleInput && datesInput) {
            modules.push({
                title: titleInput.value.trim(),
                dates: datesInput.value.trim(),
                assignments,
            });
        }
    });
    return modules;
}

// Collects policies and services
function collectPoliciesAndServices() {
    const policies = {};
    const fields = [
        'generalPolicies',
        'courseMinimumGrade',
        'lateMakeupWork',
        'attendance',
        'incomplete',
        'withdrawal',
        'academicRights',
        'academicIntegrity',
        'netiquette',
        'diversityInclusion',
        'chosenName',
        'religiousObservance',
        'academicSupport',
        'disabilityDisclosure',
        'informationTechnologies',
        'counselingServices',
        'titleIX',
        'continuityInstruction',
    ];
    fields.forEach((field) => {
        policies[field] = getValueById(field);
    });
    return policies;
}
/**
 * --- Input Validation ---
 * Ensures all required fields and data are correctly filled before submission.
 */

// Validates total weight to ensure it does not exceed 100%
function validateTotalWeight() {
    const weightInputs = document.querySelectorAll('input[name^="weight"]');
    let totalWeight = 0;

    weightInputs.forEach((input) => {
        const value = parseFloat(input.value) || 0;
        totalWeight += value;
    });

    const totalWeightElement = document.getElementById('totalWeight');
    if (totalWeightElement) {
        totalWeightElement.textContent = `${totalWeight}%`;

        if (totalWeight > 100) {
            totalWeightElement.style.color = 'red';
            console.warn('Total weight exceeds 100%. Please adjust the weights.');
        } else {
            totalWeightElement.style.color = '';
        }
    } else {
        console.error('Element with id "totalWeight" not found.');
    }
}

// Validates all required fields in the form
export function validateForm() {
    let isValid = true;

    // Check if program is selected
    const programSelect = document.getElementById('programSelect');
    if (programSelect && !programSelect.value.trim()) {
        console.error('Program selection is required.');
        isValid = false;
    }

    // Validate learning outcomes
    const learningOutcomes = document.querySelectorAll('input[name="learningOutcomes[]"]');
    learningOutcomes.forEach((input) => {
        if (!input.value.trim()) {
            console.error('Learning outcome cannot be empty.');
            isValid = false;
        }
    });

    // Validate weighting details
    validateTotalWeight();

    // Additional validations can be added here...

    return isValid;
}

