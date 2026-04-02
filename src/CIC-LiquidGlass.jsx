import { useState, useEffect, useRef } from "react";
import { LoginConnected, CampaignSelectorConnected } from './CIC-App.jsx';
import { useChat } from './hooks/useChat.js';
import { useDemandas, useMonitoramento, useCRM, useFundraising,
         useVoluntarios, useAgenda, useDebate, useEstrategia,
         useGOTV, useDiagnostico } from './hooks/useDataHooks.js';
import useAppStore from './store/useAppStore.js';
import { config as configApi } from './api/endpoints.js';
import { useTheme } from './hooks/useTheme.js';
import SuperAdmin from './SuperAdmin.jsx';
import ObsidianCloud from './components/ObsidianCloud.jsx';