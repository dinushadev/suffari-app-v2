import { Amplify } from 'aws-amplify';

const APPSYNC_ENDPOINT = process.env.NEXT_PUBLIC_APPSYNC_ENDPOINT || 
  'https://ykf2tk7lgrggvjm5ofzjfbudkm.appsync-api.us-east-1.amazonaws.com/graphql';

Amplify.configure({
  API: {
    GraphQL: {
      endpoint: APPSYNC_ENDPOINT,
      region: 'us-east-1',
      defaultAuthMode: 'lambda', // Using Lambda Authorizer
    }
  }
});

export default Amplify;


