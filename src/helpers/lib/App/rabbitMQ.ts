// import client, { Connection, Channel } from "amqplib";

// export default class RabbitMQ {
//     connection!: Connection;
//     channel!: Channel;
//     private connected!: Boolean;

//     connect() {
//         if (this.connected && this.channel) return;
//         else this.connected = true;

//         let classThis = this;
//         console.log(`⌛️ Connecting to Rabbit-MQ Server`);
//         client.connect('amqp://guest:guest@localhost:5672', function (error0: any, connection: Connection) {
//             if (error0) {
//                 throw error0;
//             }

//             console.log(connection, 'connection')
//             classThis.connection = connection
//             console.log(connection, 'connection')
//             console.log(`✅ Rabbit MQ Connection is ready`);
//         })
//     }
// }
// http://localhost:3000/dashboard/confirm-trip/?id=68a2e7d30844f9ff16865a76