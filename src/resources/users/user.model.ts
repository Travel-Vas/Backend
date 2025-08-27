import { Schema, model } from 'mongoose';
import IUser from './user.interface';
import { EMPPLOYEES_TABLE, UserRole } from '../../helpers/constants';
import bcrypt from 'bcryptjs'
const FileSchema = {
  url: {
    type: String,
    required: false
  },
  name: {
    type: String,
    required: false
  },
  size: {
    type: Number,
    required: false
  },
  type: {
    type: String,
    required: false
  },
  selected:{
    type: Boolean,
    default: false
  },
  pop_up_shown:{
    type: Boolean,
    default: false
  }
};
const userSchema = new Schema<IUser>({
  email: {
    type: String,
    unique: true,
    required: [true, 'email is required.']
  },
  country:{
    type: String,
  },
  isUnboarded:{
    type: Boolean,
    default: false,
  },
  state:{
    type: String,
  },
  postalCode: {
    type: String,
  },
  upload_size: {
    type: Number,
    default: 5
  },
  city:{
    type: String,
  },
  currency:{
    type: String,
  },
  password: {
    type: String,
  },
  name: {
    type: String,
    unique: true
  },
  dob: { Date },
  profile_image: {
    type: FileSchema,
  },
  stripeCustomerId: {
    type: String,
  },
  role: {
    type: String,
    enum: UserRole,
    default: UserRole.USER,
  },
  phone: String,
  status: {
    type: Boolean,
    default: true,
  },
  last_login: {
    type: Date,
    default: new Date(),
  },
  is_verified: {
    type: Boolean,
    default: false,
  },
  isDeleted:{
    type:Boolean,
    default: false
  },
  website: {
    type: String,
  },
  extra_picture_price: {
    type: Number,
    default: 0
  },
  instagram: {
    type: String,
  },
  facebook:{
    type: String,
  },
  linkedin:{
    type: String,
  },
  twitter:{
    type: String,
  },
  referralCode: {
    type: Schema.Types.ObjectId,
    ref: 'Referal'
  },
  suspended: {
    type: Schema.Types.ObjectId,
    ref: 'Suspended'
  },
  isSuspended: {
    type: Boolean,
    default: false
  },
  suspendedAt:{
    type: Date,
  },
  suspensionReason: {
    type: String,
  }
}, {
  timestamps: {
    createdAt: 'created_at',
    updatedAt: "updated_at"
  }
})

// employeeSchema.post("save", async function(doc){
//   try {
//     await organizationModel.findByIdAndUpdate(doc.organizationId, {
//       $push: { employees: doc._id }
//     });
//   } catch (error) {
//     console.log("Error pushing Employees Id to Oganization", error)
//   }
// })

// employeeSchema.pre('findOneAndDelete', async function(next) {
//   try {
//     const employee = await this.model.findOne(this.getQuery());
//     await organizationModel.findByIdAndUpdate(employee.organizationId, {
//       $pull: { employees: employee._id }
//     });
//     next();
//   } catch (error:any) {
//     console.log('Error removing Employee Id from Organization', error);
//     next(error);
//   }
// });

export default model(EMPPLOYEES_TABLE, userSchema);
