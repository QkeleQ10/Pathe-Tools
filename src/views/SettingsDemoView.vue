<script setup lang="ts">
import { ref } from 'vue';

// Example settings state
const dialogActive = ref(false);
const darkMode = ref(true);
const notifications = ref(false);
const autoSave = ref(true);
const fontSize = ref(14);
const language = ref('nl');
const soundEnabled = ref(true);
const volume = ref(50);
const devMode = ref(false);
const debugLogging = ref(false);
</script>

<template>
    <main>
        <div class="hero-block">
            <h1>Settings Dialog Demo</h1>
            <p>This page demonstrates the settings dialog component with modular architecture.</p>
        </div>

        <div class="block">
            <h2>Usage Example</h2>
            <p>Click the button below to open the settings dialog:</p>
            
            <SettingsDialog v-model:active="dialogActive">
                <template #button-content>
                    <Icon>settings</Icon>
                    Open Settings
                </template>

                <template #navigation>
                    <SettingsCategoryButton category-id="general" label="General" />
                    <SettingsCategoryButton category-id="appearance" label="Appearance" />
                    <SettingsCategoryButton category-id="notifications" label="Notifications" />
                    <SettingsCategoryButton category-id="audio" label="Audio" />
                    <SettingsCategoryButton category-id="advanced" label="Advanced" />
                </template>

                <template #content>
                    <SettingsSection category-id="general" title="General">
                        <SettingItem 
                            label="Language" 
                            description="Select your preferred language"
                        >
                            <Select v-model="language">
                                <option value="nl">Nederlands</option>
                                <option value="en">English</option>
                                <option value="de">Deutsch</option>
                            </Select>
                        </SettingItem>

                        <SettingItem 
                            label="Auto-save" 
                            description="Automatically save your work"
                        >
                            <InputSwitch v-model="autoSave" identifier="auto-save" />
                        </SettingItem>
                    </SettingsSection>

                    <SettingsSection category-id="appearance" title="Appearance">
                        <SettingItem 
                            label="Dark Mode" 
                            description="Enable dark theme"
                        >
                            <InputSwitch v-model="darkMode" identifier="dark-mode" />
                        </SettingItem>

                        <SettingItem 
                            label="Font Size" 
                            description="Adjust the text size"
                        >
                            <Input v-model="fontSize" type="number" min="10" max="24" />
                        </SettingItem>
                    </SettingsSection>

                    <SettingsSection category-id="notifications" title="Notifications">
                        <SettingItem 
                            label="Enable Notifications" 
                            description="Receive notifications about updates"
                        >
                            <InputSwitch v-model="notifications" identifier="notifications" />
                        </SettingItem>

                        <SettingItem 
                            label="Email Notifications" 
                            description="Receive email updates"
                        >
                            <InputCheckbox identifier="email-notifications" :disabled="!notifications" />
                        </SettingItem>
                    </SettingsSection>

                    <SettingsSection category-id="audio" title="Audio">
                        <SettingItem 
                            label="Sound Effects" 
                            description="Enable sound effects"
                        >
                            <InputSwitch v-model="soundEnabled" identifier="sound-effects" />
                        </SettingItem>

                        <SettingItem 
                            label="Volume" 
                            description="Adjust the volume level"
                        >
                            <Input v-model="volume" type="range" min="0" max="100" :disabled="!soundEnabled" />
                        </SettingItem>
                    </SettingsSection>

                    <SettingsSection category-id="advanced" title="Advanced">
                        <SettingItem 
                            label="Developer Mode" 
                            description="Enable advanced features for developers"
                        >
                            <InputSwitch v-model="devMode" identifier="dev-mode" />
                        </SettingItem>

                        <SettingItem 
                            label="Debug Logging" 
                            description="Enable verbose logging"
                        >
                            <InputSwitch v-model="debugLogging" identifier="debug-logging" />
                        </SettingItem>

                        <SettingItem 
                            label="Cache Settings" 
                            description="Clear application cache"
                        >
                            <Button class="secondary">Clear Cache</Button>
                        </SettingItem>
                    </SettingsSection>
                </template>
            </SettingsDialog>
        </div>

        <div class="block">
            <h2>Features</h2>
            <ul>
                <li><strong>Modular Architecture:</strong> Components can be used independently</li>
                <li><strong>Category Navigation:</strong> Left sidebar with clickable category buttons</li>
                <li><strong>Smooth Scrolling:</strong> Click a category to scroll to that section</li>
                <li><strong>Active Highlighting:</strong> Current category in viewport is highlighted</li>
                <li><strong>Intersection Observer:</strong> Uses modern browser API for efficient scroll tracking</li>
                <li><strong>Responsive Layout:</strong> Two-column layout with proper overflow handling</li>
            </ul>
        </div>

        <div class="block">
            <h2>Component Structure</h2>
            <p>The settings dialog consists of the following modular components:</p>
            <ul>
                <li><code>SettingsDialog</code> - Main dialog container (extends InvokableModalDialog pattern)</li>
                <li><code>SettingsCategoryButton</code> - Navigation button for categories</li>
                <li><code>SettingsSection</code> - Container for settings grouped by category</li>
                <li><code>SettingItem</code> - Individual setting with label and control</li>
            </ul>
        </div>
    </main>
</template>

<style scoped>
main {
    display: flex;
    flex-direction: column;
    align-items: center;
    padding: 32px;
    min-height: calc(100vh - 72px);
}

.hero-block {
    width: 70%;
    max-width: 800px;
    text-align: center;
    margin-bottom: 48px;
}

.hero-block h1 {
    font-size: 48px;
    margin: 0 0 16px 0;
    color: #fff;
}

.hero-block p {
    font-size: 18px;
    color: #ffffffb3;
    margin: 0;
}

.block {
    width: 70%;
    max-width: 800px;
    background: #202020;
    padding: 32px;
    border-radius: 10px;
    margin-bottom: 24px;
}

.block h2 {
    font-size: 24px;
    margin: 0 0 16px 0;
    color: #fff;
}

.block p {
    color: #ffffffb3;
    line-height: 1.6;
    margin: 0 0 16px 0;
}

.block ul {
    color: #ffffffb3;
    line-height: 1.8;
    margin: 0;
    padding-left: 24px;
}

.block code {
    background: #1c2129;
    padding: 2px 6px;
    border-radius: 3px;
    color: var(--yellow2);
    font-family: 'Courier New', monospace;
}

.block li {
    margin-bottom: 8px;
}
</style>
