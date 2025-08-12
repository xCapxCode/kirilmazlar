/* eslint-disable no-console */
import logger from '@utils/productionLogger';
/**
 * Profile Isolation Service
 * P1.2.4 - Cross-profile data bleeding prevention
 * 
 * This service ensures complete data isolation between different user profiles
 * to prevent cross-contamination of user data, cart contents, and preferences.
 */

class ProfileIsolationService {
  constructor() {
    this.currentProfile = null;
    this.profilePrefix = 'ofisnet_profile_';
    this.globalKeys = ['ofisnet_app_version', 'ofisnet_migration_status'];
  }

  /**
   * Set the current active profile
   * @param {string} profileId - Unique identifier for the user profile
   */
  setActiveProfile(profileId) {
    if (!profileId) {
      logger.warn('ProfileIsolationService: Profile ID cannot be empty');
      return;
    }

    const previousProfile = this.currentProfile;
    this.currentProfile = profileId;

    // Clear any cached data when switching profiles
    if (previousProfile && previousProfile !== profileId) {
      this.clearProfileCache();
    }

    logger.info(`ProfileIsolationService: Active profile set to ${profileId}`);
  }

  /**
   * Get the current active profile
   * @returns {string|null} Current profile ID
   */
  getActiveProfile() {
    return this.currentProfile;
  }

  /**
   * Generate profile-specific storage key
   * @param {string} key - Base storage key
   * @returns {string} Profile-isolated storage key
   */
  getProfileKey(key) {
    if (!this.currentProfile) {
      logger.warn('ProfileIsolationService: No active profile set');
      return key;
    }

    // Don't prefix global keys
    if (this.globalKeys.includes(key)) {
      return key;
    }

    return `${this.profilePrefix}${this.currentProfile}_${key}`;
  }

  /**
   * Store data in profile-isolated storage
   * @param {string} key - Storage key
   * @param {any} value - Value to store
   */
  setProfileData(key, value) {
    if (!this.currentProfile) {
      logger.warn('ProfileIsolationService: Cannot store data without active profile');
      return;
    }

    const profileKey = this.getProfileKey(key);
    try {
      const serializedValue = typeof value === 'string' ? value : JSON.stringify(value);
      localStorage.setItem(profileKey, serializedValue);
    } catch (error) {
      logger.error('ProfileIsolationService: Error storing profile data:', error);
    }
  }

  /**
   * Retrieve data from profile-isolated storage
   * @param {string} key - Storage key
   * @param {any} defaultValue - Default value if key doesn't exist
   * @returns {any} Retrieved value or default
   */
  getProfileData(key, defaultValue = null) {
    if (!this.currentProfile) {
      logger.warn('ProfileIsolationService: Cannot retrieve data without active profile');
      return defaultValue;
    }

    const profileKey = this.getProfileKey(key);
    try {
      const value = localStorage.getItem(profileKey);
      if (value === null) return defaultValue;

      // Try to parse JSON, fall back to string if it fails
      try {
        return JSON.parse(value);
      } catch {
        return value;
      }
    } catch (error) {
      logger.error('ProfileIsolationService: Error retrieving profile data:', error);
      return defaultValue;
    }
  }

  /**
   * Remove data from profile-isolated storage
   * @param {string} key - Storage key to remove
   */
  removeProfileData(key) {
    if (!this.currentProfile) {
      logger.warn('ProfileIsolationService: Cannot remove data without active profile');
      return;
    }

    const profileKey = this.getProfileKey(key);
    try {
      localStorage.removeItem(profileKey);
    } catch (error) {
      logger.error('ProfileIsolationService: Error removing profile data:', error);
    }
  }

  /**
   * Clear all data for the current profile
   */
  clearCurrentProfile() {
    if (!this.currentProfile) {
      logger.warn('ProfileIsolationService: No active profile to clear');
      return;
    }

    const prefix = `${this.profilePrefix}${this.currentProfile}_`;
    const keysToRemove = [];

    // Find all keys belonging to current profile
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith(prefix)) {
        keysToRemove.push(key);
      }
    }

    // Remove all profile-specific keys
    keysToRemove.forEach(key => {
      try {
        localStorage.removeItem(key);
      } catch (error) {
        logger.error(`ProfileIsolationService: Error removing key ${key}:`, error);
      }
    });

    logger.info(`ProfileIsolationService: Cleared ${keysToRemove.length} items for profile ${this.currentProfile}`);
  }

  /**
   * Clear all profiles (admin function)
   */
  clearAllProfiles() {
    const keysToRemove = [];

    // Find all profile keys
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith(this.profilePrefix) && !this.globalKeys.includes(key)) {
        keysToRemove.push(key);
      }
    }

    // Remove all profile keys
    keysToRemove.forEach(key => {
      try {
        localStorage.removeItem(key);
      } catch (error) {
        logger.error(`ProfileIsolationService: Error removing key ${key}:`, error);
      }
    });

    logger.info(`ProfileIsolationService: Cleared all profiles (${keysToRemove.length} items)`);
  }

  /**
   * Get list of all existing profiles
   * @returns {string[]} Array of profile IDs
   */
  getExistingProfiles() {
    const profiles = new Set();

    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith(this.profilePrefix)) {
        const match = key.match(new RegExp(`^${this.profilePrefix}([^_]+)_`));
        if (match) {
          profiles.add(match[1]);
        }
      }
    }

    return Array.from(profiles);
  }

  /**
   * Switch to a different profile
   * @param {string} newProfileId - Target profile ID
   */
  switchProfile(newProfileId) {
    if (!newProfileId) {
      logger.warn('ProfileIsolationService: New profile ID cannot be empty');
      return;
    }

    const previousProfile = this.currentProfile;
    this.setActiveProfile(newProfileId);

    // Clear cached data
    this.clearProfileCache();

    logger.info(`ProfileIsolationService: Switched from ${previousProfile} to ${newProfileId}`);
  }

  /**
   * Clear any cached profile data (internal method)
   */
  clearProfileCache() {
    // This method can be extended to clear specific caches
    // For now, it's a placeholder for future cache management
  }

  /**
   * Validate profile isolation (debugging method)
   * @returns {Object} Validation results
   */
  validateProfileIsolation() {
    const profiles = this.getExistingProfiles();
    const validation = {
      totalProfiles: profiles.length,
      currentProfile: this.currentProfile,
      profileData: {},
      crossContamination: []
    };

    profiles.forEach(profileId => {
      const prefix = `${this.profilePrefix}${profileId}_`;
      const profileKeys = [];

      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && key.startsWith(prefix)) {
          profileKeys.push(key);
        }
      }

      validation.profileData[profileId] = profileKeys.length;
    });

    return validation;
  }
}

// Create and export singleton instance
const profileIsolationService = new ProfileIsolationService();

export default profileIsolationService;
