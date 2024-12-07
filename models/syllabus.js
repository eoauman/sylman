const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const syllabusSchema = new Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    syllabusData: {
        programSelect: { type: String, default: '' },
        courseTitle: { type: String, default: '' },
        courseNumber: { type: String, default: '' },
        credits: { type: String, default: '' },
        placement: { type: String, default: '' },
        courseType: { type: String, default: '' },
        courseDelivery: { type: String, default: '' },
        courseLead: { type: String, default: '' },
        leadEmail: { type: String, default: '' },
        leadPhone: { type: String, default: '' },
        leadOffice: { type: String, default: '' },
        leadOfficeHours: { type: String, default: '' },
        courseReqs: { type: String, default: '' },
        courseDescription: { type: String, default: '' },
        requiredMaterials: { type: String, default: '' },
        instructionalMethods: { type: String, default: '' },
        courseCommunications: { type: String, default: '' },
        instructors: [
            {
                name: { type: String, default: '' },
                email: { type: String, default: '' },
            },
        ],
        learningOutcomes: { type: [String], default: [] },
        assessments: {
            type: [
                {
                    detail: { type: String, default: '' },
                    description: { type: String, default: '' },
                },
            ],
            default: [],
        },
        weightingDetails: {
            type: [
                {
                    component: { type: String, default: '' },
                    weight: { type: Number, default: 0 },
                },
            ],
            default: [],
        },
        gradingElements: { type: [String], default: [] },
        modules: {
            type: [
                {
                    title: { type: String, default: '' },
                    description: { type: String, default: '' },
                },
            ],
            default: [],
        },
        slo: {
            type: {
                slo1: { type: [String], default: [] },
                slo2: { type: [String], default: [] },
                slo3: { type: [String], default: [] },
                slo4: { type: [String], default: [] },
                slo5: { type: [String], default: [] },
            },
            default: {},
        },
        policiesAndServices: {
            type: {
                generalPolicies: { type: String, default: '' },
                courseMinimumGrade: { type: String, default: '' },
                lateMakeupWork: { type: String, default: '' },
                attendance: { type: String, default: '' },
                incomplete: { type: String, default: '' },
                withdrawal: { type: String, default: '' },
                academicRights: { type: String, default: '' },
                academicIntegrity: { type: String, default: '' },
                netiquette: { type: String, default: '' },
                diversityInclusion: { type: String, default: '' },
                chosenName: { type: String, default: '' },
                religiousObservance: { type: String, default: '' },
                academicSupport: { type: String, default: '' },
                disabilityDisclosure: { type: String, default: '' },
                informationTechnologies: { type: String, default: '' },
                counselingServices: { type: String, default: '' },
                titleIX: { type: String, default: '' },
                continuityInstruction: { type: String, default: '' },
            },
            default: {},
        },
        submissionDate: {
            type: Date,
            default: Date.now,
            get: (value) => (value ? value.toLocaleDateString('en-US') : null),
        },
        lastEdited: {
            type: Date,
            default: Date.now,
            get: (value) => (value ? value.toLocaleDateString('en-US') : null),
        },
    },
}, {
    timestamps: true, // Automatically adds `createdAt` and `updatedAt`
    toJSON: { getters: true },
    toObject: { getters: true },
});

module.exports = mongoose.model('Syllabus', syllabusSchema);
