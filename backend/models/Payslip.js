import mongoose from "mongoose";

const payslipSchema = mongoose.Schema(
    {
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true
        },
        organizationId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Organization",
            required: true
        },        
        month: {
            type: Number,
            required: true
        },
        year: {
            type: Number,
            required: true
        },
        basicSalary: {
            type: Number,
            required: true
        },
        allowances: {
            type: Number,
            default: 0
        },
        deductions: {
            type: Number,
            default: 0
        },
        netSalary: {
            type: Number,
            required: true
        }
    },
    {
        timestamps: true
    }
);

payslipSchema.index(
  {
    userId: 1,
    month: 1,
    year: 1,
  },
  {
    unique: true,
  }
);

const Payslip = mongoose.model("Payslip", payslipSchema);

export default Payslip;