const serviceAccount = require('./service-account-gcf.json');
const {Firestore} = require('@google-cloud/firestore');
const Razorpay = require('razorpay')
const crypto = require('crypto');

const firestore = new Firestore({
  projectId: 'vewmetcalling',
  credentials: serviceAccount
});
const rzp = new Razorpay({ key_id: 'rzp_test_js1xnIKYsqlp6X', key_secret: 'IeAf0vfPnCo0ikAmSTvu78Ll' })
function verifySubscriptionPayment(body, paymentSignature){
  let verified = false;
  // TODO move this logic to separate endpoint like /payment/verify
  const expectedSignature = crypto.createHmac('sha256', 'IeAf0vfPnCo0ikAmSTvu78Ll')
                              .update(body.toString())
                              .digest('hex');
  if(expectedSignature === paymentSignature){
    verified=true;
  };
  return verified;
}

const paymentId = 'pay_LYOPgphu5c6XhL';
const subscriptionId = 'sub_LYOGYtDtJUtXYB';
const paymentVerificationBody = paymentId + "|" + subscriptionId ;
const body = paymentVerificationBody;
const paymentSignature = crypto.createHmac('sha256', 'IeAf0vfPnCo0ikAmSTvu78Ll')
                              .update(body.toString())
                              .digest('hex');

  const verified = verifySubscriptionPayment(paymentVerificationBody, paymentSignature);
  console.log(verified, '***\n')
  if(!verified){
    reply.code(400);
    return {
      status: 'verification failed'
    };
  }




// function getSubscriptionKeyType(plan){
//       switch(plan){
//         case 'monthly':
//             return 'MonthlySubscriptionId';
//         case 'annual':
//             return 'AnnualSubscriptionId';
//         default:
//             break;
//       }
// }

// function getInstancesCount(plan, planArr, statusArr){
//   let count = 0;
//   planArr.forEach((plan, index)=>{
//     if(plan === plan && statusArr[index] !== 'deleted'){
//       count++;
//     }
//   })
//   return count;
// }
// // Define the user UUID to query
// const user_uuid = 'hiTWdVJEEyeOOlrT2VzOZX9Dinj1';
//     updateAdminDetails(user_uuid, 'daddy2', {instances_plan: 'monthly', instances_status: 'deleted'});
//     // instance_status: active, sleep, deleted


//   async function updateAdminDetails(user_uuid, affectedInstance, instanceMeta) {
//     const subscriptionTypeId = getSubscriptionKeyType(instanceMeta.instances_plan)

//     await firestore.runTransaction(async (transaction) => {
//       // If two transactions compete, firestore fails one of them
//       // failing transactions automatically retry
//       // if a onCreate trigger's transaction fails, we'll delete the created record and throw error to user's UI
//       const userDetailsRef = firestore.collection('UserDetails').doc(user_uuid);
//       const userDetailsDoc = await transaction.get(userDetailsRef);
      
  
//     if (userDetailsDoc.exists) {
//       const userDetails = userDetailsDoc.data();
//       if (userDetails.instances !== undefined) {
//         const instancesArr = userDetails.instances;
//         const instances_plan = userDetails.instances_plan;
//         const instances_status = userDetails.instances_status;
//         const arrObj = {
//             instances_plan, instances_status
//         }
//         const instancesJson = transformToJson(instancesArr, arrObj);
//         // whether instance created or updated, both cases handled by below line
//         instancesJson[affectedInstance] = instanceMeta;
//         const updatedArrays = transformToArrays(instancesJson);
//         const subscriptionObj = await handlePayment(subscriptionTypeId, userDetails[subscriptionTypeId], affectedInstance, {planId: "plan_L446RyGrdMvhPi", instances: getInstancesCount(instanceMeta.instances_plan, updatedArrays.instances_plan, updatedArrays.instances_status)}); // monthly/annual plan. number of instances under the plan
//         if(subscriptionObj.subscriptionStatus.endsWith('-Error')){
//             transaction.update(userDetailsRef, { ...subscriptionObj }); // do not push the instance
//         } else {
//             transaction.update(userDetailsRef, { ...updatedArrays, ...subscriptionObj });
//         }
//       } else {
//         const instancesJson = {};
//         instancesJson[affectedInstance] = instanceMeta;
//         const updatedArrays = transformToArrays(instancesJson);
//         const subscriptionObj = await handlePayment(subscriptionTypeId, userDetails[subscriptionTypeId], affectedInstance, {planId: "plan_L446RyGrdMvhPi", instances: getInstancesCount(instanceMeta.instances_plan, updatedArrays.instances_plan, updatedArrays.instances_status)});
//         if(subscriptionObj.subscriptionStatus.endsWith('-Error')){
//             transaction.update(userDetailsRef, { ...subscriptionObj }); // do not push the instance
//         } else {
//             transaction.update(userDetailsRef, { ...updatedArrays, ...subscriptionObj });
//         }
//       }
//     }
      
      
//     });
//   }

// function transformToJson(instances, arrays) {
//     /* USAGE EXAMPLE
//         const instances = ["bob", "sam", "tom"];
//         const status = ['sleep', 'active', 'active'];
//         const plan = ['monthly', 'monthly', 'annual'];
//         const arrays = {
//             status,
//             plan,
//         };
//     transformToJson(instances, arrays);

// OUTPUT:
//   {
//     bob: { status: 'sleep', plan: 'monthly' },
//     sam: { status: 'active', plan: 'monthly' },
//     tom: { status: 'active', plan: 'annual' }
//   }
// */
//     const result = {};
//     instances.forEach((instance, index) => {
//       const userResult = {};
//       Object.keys(arrays).forEach(key => {
//         const arr = arrays[key];
//           const [prop, value] = [key, arr[index]];
//           userResult[prop] = value;
//       });
//       result[instance] = userResult;
//     });
//     return result;
//   }

//   function transformToArrays(obj) {
//     /* USAGE EXAMPLE

//             const INPUT=
//             {
//                 bob: { status: 'sleep', plan: 'monthly' },
//                 sam: { status: 'active', plan: 'monthly' },
//                 tom: { status: 'active', plan: 'annual' }
//             };
            
//             const OUTPUT = transformToArrays(INPUT);
//             // OUTPUT
//             // {
//                    instances: ['bob', 'sam', 'tom']
//             //     status: [ 'sleep', 'active', 'active' ],
//             //     plan: [ 'monthly', 'monthly', 'annual' ]
//             // }  
// */
//     const instances = Object.keys(obj);
//     const outputArrays = {instances};
//     instances.forEach((instanceKey) => {
//       const instanceObj = obj[instanceKey];
//       Object.entries(instanceObj).forEach(([prop, val]) => {
//         if (!outputArrays[prop]) {
//           outputArrays[prop] = [val];
//         } else{
//           outputArrays[prop].push(val);
//         }
//       });
//     });
//     return outputArrays;
// }


// async function handlePayment(subscriptionTypeId, subscriptionId, affectedInstance, options){
//     // doc is at https://razorpay.com/docs/api/payments/subscriptions/#subscriptions-entity-entity
//     if(!subscriptionId){
//         const sub_res = await rzp.subscriptions.create({
//             plan_id: options.planId, // ALERT TODO store this securely in some config file
//             customer_notify: 1,
//             quantity: options.instances,
//             total_count: 12,
//             // start_at: 1495995837, to start immediately, do not explicitly send start_at
//             // addons: [],
//             notes: {
//                 userId: "value3",
//                 username: "vewmet member"
//             }
//         })
//         const subscriptionId = sub_res.id;
//         return {
//             [subscriptionTypeId]: subscriptionId,
//             subscriptionStatus: sub_res.status // 'created' status for unpaid subscription
//         }
//     }
//     // verify status of subscriptionId
//     const subscriptionDetails = await rzp.subscriptions.fetch(subscriptionId);
//     if(subscriptionDetails.status!== 'active' && subscriptionDetails.quantity !== options.instances ){ // if number of instances under the plan have changed, then update the subscription
//         try{
//         const sub_res = await rzp.subscriptions.update(subscriptionId, {
//             plan_id: options.planId, // monthly plan, annual plan, etc
//             customer_notify: 1,
//             quantity: options.instances, // how many instances under this plan
//             schedule_change_at: 'now',
//             // start_at: 1495995837, to start immediately, do not explicitly send start_at
//             // addons: [],
//         }); 
//         return {
//             [subscriptionTypeId]: subscriptionId,
//             subscriptionStatus: sub_res.status
//         }
//         } catch(err){
//             return {
//                 [subscriptionTypeId]: subscriptionId,
//                 subscriptionStatus: `instance_${affectedInstance}-${1000000*Math.random()}-Error` // potentially 'paused', 'authenticated', etc status
//             }
//         }
        
//         // if(sub_res.status !== 'authenticated'){
//         //     throw new Error('The subscription plan could not be updated');
//         // }
//     } else {
//         return {
//             [subscriptionTypeId]: subscriptionId,
//             subscriptionStatus: subscriptionDetails.status // potentially 'paused', 'authenticated', etc status
//         }
//     }			
// }


			