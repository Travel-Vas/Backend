// import {OAuth2Client} from 'google-auth-library';
// import { GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET } from '../../constants';



// export class GoogleService {

//   private readonly client: OAuth2Client;

//   constructor() {
//     this.client = new OAuth2Client(GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET)
//   }

//   public async verifyToken (token: string) {
//     try {
//       const ticket = await this.client.verifyIdToken({idToken: token})

//       const data = ticket.getPayload()

//       if(data?.email) {
//         return {
//           email: data.email,
//           googleId: data.sub,
//           picture: data.picture,
//           first_name: data.given_name,
//           last_name: data.family_name,
//         }
//       }

//       return null
//     }catch (e: any) {
//       return null
//     }
//   }
// }
