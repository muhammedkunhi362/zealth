import mongoose, { Schema, Document } from 'mongoose';

export interface IAssessment extends Document {
  userId: mongoose.Types.ObjectId;
  assessmentDate: Date;
  answers: Record<string, string | number>;
  height: number;
  weight: number;
  waist: number;
  bmi: number;
  categoryScores: {
    nutrition: number;
    movement: number;
    sleep: number;
    stress: number;
    weightBody: number;
    hydration: number;
    dailyHabits: number;
  };
  totalScore: number;
  overallStatus: string;
  strongerAreas: string[];
  attentionAreas: string[];
  firstFocus: {
    focus: string;
    why: string;
    smallStart: string;
  };
  recommendations: Record<string, string[]>;
  createdAt: Date;
}

const AssessmentSchema: Schema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    assessmentDate: { type: Date, default: Date.now },
    answers: { type: Schema.Types.Mixed, default: {} },
    height: { type: Number, required: true },
    weight: { type: Number, required: true },
    waist: { type: Number, required: true },
    bmi: { type: Number, required: true },
    categoryScores: {
      nutrition: { type: Number, required: true },
      movement: { type: Number, required: true },
      sleep: { type: Number, required: true },
      stress: { type: Number, required: true },
      weightBody: { type: Number, required: true },
      hydration: { type: Number, required: true },
      dailyHabits: { type: Number, required: true },
    },
    totalScore: { type: Number, required: true },
    overallStatus: { type: String, required: true },
    strongerAreas: { type: [String], required: true },
    attentionAreas: { type: [String], required: true },
    firstFocus: {
      focus: { type: String, required: true },
      why: { type: String, required: true },
      smallStart: { type: String, required: true }
    },
    recommendations: { type: Schema.Types.Mixed, default: {} },
  },
  { timestamps: true }
);

export default mongoose.models.Assessment || mongoose.model<IAssessment>('Assessment', AssessmentSchema);
