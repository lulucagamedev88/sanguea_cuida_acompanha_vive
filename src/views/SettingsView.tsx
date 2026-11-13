/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { AppSettingsSection } from '../components/settings/AppSettingsSection';

export const SettingsView: React.FC = () => {
  return (
    <div className="space-y-6 animate-in fade-in duration-150">
      <AppSettingsSection />
    </div>
  );
};
