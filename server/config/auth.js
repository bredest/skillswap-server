const { betterAuth } = require('better-auth');
const { mongodbAdapter } = require('better-auth/adapters/mongoose');
const mongoose = require('mongoose');

const auth = betterAuth({
  database: mongodbAdapter(mongoose.connection),

  emailAndPassword: {
    enabled: true,
    requireEmailVerification: false,
    minPasswordLength: 6,
  },

  socialProviders: {
    google: {
      clientId: process.env.GOOGLE_CLIENT_ID || '',
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || '',
    },
  },

  user: {
    additionalFields: {
      role: {
        type: 'string',
        required: false,
        defaultValue: 'client',
        input: false,
      },
      skills: {
        type: 'string[]',
        required: false,
        defaultValue: [],
        input: false,
      },
      bio: {
        type: 'string',
        required: false,
        defaultValue: '',
        input: false,
      },
      hourlyRate: {
        type: 'number',
        required: false,
        defaultValue: 0,
        input: false,
      },
      isBlocked: {
        type: 'boolean',
        required: false,
        defaultValue: false,
        input: false,
      },
      isVerified: {
        type: 'boolean',
        required: false,
        defaultValue: false,
        input: false,
      },
      image: {
        type: 'string',
        required: false,
      },
    },
  },

  session: {
    cookieCache: {
      enabled: true,
      maxAge: 5 * 60,
    },
  },

  advanced: {
    cookies: {
      session_token: {
        name: 'skillswap_session',
      },
    },
  },
});

module.exports = { auth };
