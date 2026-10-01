/**
 * [UTILITY / SETUP]
 * Configures your local Inkeep CLI profile in ~/.inkeep/profiles.yaml.
 * Ensures the CLI routes commands (like push, pull, list-agent) to your local API (:3002).
 */

import { ProfileManager } from '../node_modules/@inkeep/agents-cli/dist/utils/profiles/profile-manager.js';

const profileManager = new ProfileManager();
const localProfile = {
  remote: {
    api: 'http://127.0.0.1:3002',
    manageUi: 'http://127.0.0.1:3000',
  },
  credential: 'none',
  environment: 'development',
};

const profilesConfig = {
  activeProfile: 'local',
  profiles: {
    local: localProfile,
    cloud: {
      remote: 'cloud',
      credential: 'inkeep-cloud',
      environment: 'production',
    },
  },
};

profileManager.saveProfiles(profilesConfig);
console.log('✅ Local profile configured and activated successfully!');
