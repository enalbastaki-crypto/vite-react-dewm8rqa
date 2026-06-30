import React, { useState, useEffect, useMemo } from 'react';
import { Trophy, CalendarDays, BarChart3, Settings, Lock, Check, Save, UserCircle, Edit2, Clock, LogIn, UserPlus, Trash2, ShieldAlert, Eye, Download } from 'lucide-react';
import { initializeApp } from 'firebase/app';
import { getAuth, signInAnonymously, signInWithCustomToken, onAuthStateChanged } from 'firebase/auth';
import { getFirestore, collection, doc, setDoc, onSnapshot, deleteDoc, writeBatch } from 'firebase/firestore';

// --- Firebase Configuration ---
const firebaseConfig = {
  apiKey: "AIzaSyC8S_ucFYD0yuwmnwHGrjMwMnCUKKitmXo",
  authDomain: "wc-2026-arabic.firebaseapp.com",
  projectId: "wc-2026-arabic",
  storageBucket: "wc-2026-arabic.firebasestorage.app",
  messagingSenderId: "304563147258",
  appId: "1:304563147258:web:8c63bf9230d09820ab9443"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const appId = 'world-cup-app-id-en'; 

const ADMIN_PASSCODE = '6014'; 
const ADMIN_USERS = ['Ebrahim Albastaki', 'Ahmed Abdulkarim'];

const ALL_48_TEAMS = [
  "Algeria", "Argentina", "Australia", "Austria", "Belgium", "Bosnia and Herzegovina", "Brazil", "Cabo Verde", "Canada", "Colombia", "Congo DR", "Côte d'Ivoire", "Croatia", "Curaçao", "Czechia", "Ecuador", "Egypt", "England", "France", "Germany", "Ghana", "Haiti", "Iran", "Iraq", "Japan", "Jordan", "Korea Republic", "Mexico", "Morocco", "Netherlands", "New Zealand", "Norway", "Panama", "Paraguay", "Portugal", "Qatar", "Saudi Arabia", "Scotland", "Senegal", "South Africa", "Spain", "Sweden", "Switzerland", "Tunisia", "Türkiye", "USA", "Uruguay", "Uzbekistan"
];

const BASE_MATCHES = [
  // --- Group Stage ---
  { id: "m1", order: 1, group: 'Group Stage - Group A', date: '2026-06-11', time: '22:00', teamA: 'Mexico', teamB: 'South Africa', isLocked: false, actualA: null, actualB: null },
  { id: "m2", order: 2, group: 'Group Stage - Group A', date: '2026-06-12', time: '05:00', teamA: 'Korea Republic', teamB: 'Czechia', isLocked: false, actualA: null, actualB: null },
  { id: "m3", order: 3, group: 'Group Stage - Group B', date: '2026-06-12', time: '22:00', teamA: 'Canada', teamB: 'Bosnia and Herzegovina', isLocked: false, actualA: null, actualB: null },
  { id: "m4", order: 4, group: 'Group Stage - Group D', date: '2026-06-13', time: '04:00', teamA: 'USA', teamB: 'Paraguay', isLocked: false, actualA: null, actualB: null },
  { id: "m5", order: 5, group: 'Group Stage - Group B', date: '2026-06-13', time: '22:00', teamA: 'Qatar', teamB: 'Switzerland', isLocked: false, actualA: null, actualB: null },
  { id: "m6", order: 6, group: 'Group Stage - Group C', date: '2026-06-14', time: '01:00', teamA: 'Brazil', teamB: 'Morocco', isLocked: false, actualA: null, actualB: null },
  { id: "m7", order: 7, group: 'Group Stage - Group C', date: '2026-06-14', time: '04:00', teamA: 'Haiti', teamB: 'Scotland', isLocked: false, actualA: null, actualB: null },
  { id: "m8", order: 8, group: 'Group Stage - Group D', date: '2026-06-14', time: '07:00', teamA: 'Australia', teamB: 'Türkiye', isLocked: false, actualA: null, actualB: null },
  { id: "m9", order: 9, group: 'Group Stage - Group E', date: '2026-06-14', time: '20:00', teamA: 'Germany', teamB: 'Curaçao', isLocked: false, actualA: null, actualB: null },
  { id: "m10", order: 10, group: 'Group Stage - Group F', date: '2026-06-14', time: '23:00', teamA: 'Netherlands', teamB: 'Japan', isLocked: false, actualA: null, actualB: null },
  { id: "m11", order: 11, group: 'Group Stage - Group E', date: '2026-06-15', time: '02:00', teamA: "Côte d'Ivoire", teamB: 'Ecuador', isLocked: false, actualA: null, actualB: null },
  { id: "m12", order: 12, group: 'Group Stage - Group F', date: '2026-06-15', time: '05:00', teamA: 'Sweden', teamB: 'Tunisia', isLocked: false, actualA: null, actualB: null },
  { id: "m13", order: 13, group: 'Group Stage - Group H', date: '2026-06-15', time: '19:00', teamA: 'Spain', teamB: 'Cabo Verde', isLocked: false, actualA: null, actualB: null },
  { id: "m14", order: 14, group: 'Group Stage - Group G', date: '2026-06-15', time: '22:00', teamA: 'Belgium', teamB: 'Egypt', isLocked: false, actualA: null, actualB: null },
  { id: "m15", order: 15, group: 'Group Stage - Group H', date: '2026-06-16', time: '01:00', teamA: 'Saudi Arabia', teamB: 'Uruguay', isLocked: false, actualA: null, actualB: null },
  { id: "m16", order: 16, group: 'Group Stage - Group G', date: '2026-06-16', time: '04:00', teamA: 'Iran', teamB: 'New Zealand', isLocked: false, actualA: null, actualB: null },
  { id: "m17", order: 17, group: 'Group Stage - Group I', date: '2026-06-16', time: '22:00', teamA: 'France', teamB: 'Senegal', isLocked: false, actualA: null, actualB: null },
  { id: "m18", order: 18, group: 'Group Stage - Group I', date: '2026-06-17', time: '01:00', teamA: 'Iraq', teamB: 'Norway', isLocked: false, actualA: null, actualB: null },
  { id: "m19", order: 19, group: 'Group Stage - Group J', date: '2026-06-17', time: '04:00', teamA: 'Argentina', teamB: 'Algeria', isLocked: false, actualA: null, actualB: null },
  { id: "m20", order: 20, group: 'Group Stage - Group J', date: '2026-06-17', time: '07:00', teamA: 'Austria', teamB: 'Jordan', isLocked: false, actualA: null, actualB: null },
  { id: "m21", order: 21, group: 'Group Stage - Group K', date: '2026-06-17', time: '20:00', teamA: 'Portugal', teamB: 'Congo DR', isLocked: false, actualA: null, actualB: null },
  { id: "m22", order: 22, group: 'Group Stage - Group L', date: '2026-06-17', time: '23:00', teamA: 'England', teamB: 'Croatia', isLocked: false, actualA: null, actualB: null },
  { id: "m23", order: 23, group: 'Group Stage - Group L', date: '2026-06-18', time: '02:00', teamA: 'Ghana', teamB: 'Panama', isLocked: false, actualA: null, actualB: null },
  { id: "m24", order: 24, group: 'Group Stage - Group K', date: '2026-06-18', time: '05:00', teamA: 'Uzbekistan', teamB: 'Colombia', isLocked: false, actualA: null, actualB: null },
  { id: "m25", order: 25, group: 'Group Stage - Group A', date: '2026-06-18', time: '19:00', teamA: 'Czechia', teamB: 'South Africa', isLocked: false, actualA: null, actualB: null },
  { id: "m26", order: 26, group: 'Group Stage - Group B', date: '2026-06-18', time: '22:00', teamA: 'Switzerland', teamB: 'Bosnia and Herzegovina', isLocked: false, actualA: null, actualB: null },
  { id: "m27", order: 27, group: 'Group Stage - Group B', date: '2026-06-19', time: '01:00', teamA: 'Canada', teamB: 'Qatar', isLocked: false, actualA: null, actualB: null },
  { id: "m28", order: 28, group: 'Group Stage - Group A', date: '2026-06-19', time: '04:00', teamA: 'Mexico', teamB: 'Korea Republic', isLocked: false, actualA: null, actualB: null },
  { id: "m29", order: 29, group: 'Group Stage - Group D', date: '2026-06-19', time: '22:00', teamA: 'USA', teamB: 'Australia', isLocked: false, actualA: null, actualB: null },
  { id: "m30", order: 30, group: 'Group Stage - Group C', date: '2026-06-20', time: '01:00', teamA: 'Scotland', teamB: 'Morocco', isLocked: false, actualA: null, actualB: null },
  { id: "m31", order: 31, group: 'Group Stage - Group C', date: '2026-06-20', time: '03:30', teamA: 'Brazil', teamB: 'Haiti', isLocked: false, actualA: null, actualB: null },
  { id: "m32", order: 32, group: 'Group Stage - Group D', date: '2026-06-20', time: '07:00', teamA: 'Türkiye', teamB: 'Paraguay', isLocked: false, actualA: null, actualB: null },
  { id: "m33", order: 33, group: 'Group Stage - Group F', date: '2026-06-20', time: '20:00', teamA: 'Netherlands', teamB: 'Sweden', isLocked: false, actualA: null, actualB: null },
  { id: "m34", order: 34, group: 'Group Stage - Group E', date: '2026-06-20', time: '23:00', teamA: 'Germany', teamB: "Côte d'Ivoire", isLocked: false, actualA: null, actualB: null },
  { id: "m35", order: 35, group: 'Group Stage - Group E', date: '2026-06-21', time: '03:00', teamA: 'Ecuador', teamB: 'Curaçao', isLocked: false, actualA: null, actualB: null },
  { id: "m36", order: 36, group: 'Group Stage - Group F', date: '2026-06-21', time: '07:00', teamA: 'Tunisia', teamB: 'Japan', isLocked: false, actualA: null, actualB: null },
  { id: "m37", order: 37, group: 'Group Stage - Group H', date: '2026-06-21', time: '19:00', teamA: 'Spain', teamB: 'Saudi Arabia', isLocked: false, actualA: null, actualB: null },
  { id: "m38", order: 38, group: 'Group Stage - Group G', date: '2026-06-21', time: '22:00', teamA: 'Belgium', teamB: 'Iran', isLocked: false, actualA: null, actualB: null },
  { id: "m39", order: 39, group: 'Group Stage - Group H', date: '2026-06-22', time: '01:00', teamA: 'Uruguay', teamB: 'Cabo Verde', isLocked: false, actualA: null, actualB: null },
  { id: "m40", order: 40, group: 'Group Stage - Group G', date: '2026-06-22', time: '04:00', teamA: 'New Zealand', teamB: 'Egypt', isLocked: false, actualA: null, actualB: null },
  { id: "m41", order: 41, group: 'Group Stage - Group J', date: '2026-06-22', time: '20:00', teamA: 'Argentina', teamB: 'Austria', isLocked: false, actualA: null, actualB: null },
  { id: "m42", order: 42, group: 'Group Stage - Group I', date: '2026-06-23', time: '00:00', teamA: 'France', teamB: 'Iraq', isLocked: false, actualA: null, actualB: null },
  { id: "m43", order: 43, group: 'Group Stage - Group I', date: '2026-06-23', time: '03:00', teamA: 'Norway', teamB: 'Senegal', isLocked: false, actualA: null, actualB: null },
  { id: "m44", order: 44, group: 'Group Stage - Group J', date: '2026-06-23', time: '06:00', teamA: 'Jordan', teamB: 'Algeria', isLocked: false, actualA: null, actualB: null },
  { id: "m45", order: 45, group: 'Group Stage - Group K', date: '2026-06-23', time: '20:00', teamA: 'Portugal', teamB: 'Uzbekistan', isLocked: false, actualA: null, actualB: null },
  { id: "m46", order: 46, group: 'Group Stage - Group L', date: '2026-06-23', time: '23:00', teamA: 'England', teamB: 'Ghana', isLocked: false, actualA: null, actualB: null },
  { id: "m47", order: 47, group: 'Group Stage - Group L', date: '2026-06-24', time: '02:00', teamA: 'Panama', teamB: 'Croatia', isLocked: false, actualA: null, actualB: null },
  { id: "m48", order: 48, group: 'Group Stage - Group K', date: '2026-06-24', time: '05:00', teamA: 'Colombia', teamB: 'Congo DR', isLocked: false, actualA: null, actualB: null },
  { id: "m49", order: 49, group: 'Group Stage - Group B', date: '2026-06-24', time: '22:00', teamA: 'Switzerland', teamB: 'Canada', isLocked: false, actualA: null, actualB: null },
  { id: "m50", order: 50, group: 'Group Stage - Group B', date: '2026-06-24', time: '22:00', teamA: 'Bosnia and Herzegovina', teamB: 'Qatar', isLocked: false, actualA: null, actualB: null },
  { id: "m51", order: 51, group: 'Group Stage - Group C', date: '2026-06-25', time: '01:00', teamA: 'Scotland', teamB: 'Brazil', isLocked: false, actualA: null, actualB: null },
  { id: "m52", order: 52, group: 'Group Stage - Group C', date: '2026-06-25', time: '01:00', teamA: 'Morocco', teamB: 'Haiti', isLocked: false, actualA: null, actualB: null },
  { id: "m53", order: 53, group: 'Group Stage - Group A', date: '2026-06-25', time: '04:00', teamA: 'Czechia', teamB: 'Mexico', isLocked: false, actualA: null, actualB: null },
  { id: "m54", order: 54, group: 'Group Stage - Group A', date: '2026-06-25', time: '04:00', teamA: 'South Africa', teamB: 'Korea Republic', isLocked: false, actualA: null, actualB: null },
  { id: "m55", order: 55, group: 'Group Stage - Group E', date: '2026-06-25', time: '23:00', teamA: 'Curaçao', teamB: "Côte d'Ivoire", isLocked: false, actualA: null, actualB: null },
  { id: "m56", order: 56, group: 'Group Stage - Group E', date: '2026-06-25', time: '23:00', teamA: 'Ecuador', teamB: 'Germany', isLocked: false, actualA: null, actualB: null },
  { id: "m57", order: 57, group: 'Group Stage - Group F', date: '2026-06-26', time: '02:00', teamA: 'Japan', teamB: 'Sweden', isLocked: false, actualA: null, actualB: null },
  { id: "m58", order: 58, group: 'Group Stage - Group F', date: '2026-06-26', time: '02:00', teamA: 'Tunisia', teamB: 'Netherlands', isLocked: false, actualA: null, actualB: null },
  { id: "m59", order: 59, group: 'Group Stage - Group D', date: '2026-06-26', time: '05:00', teamA: 'Türkiye', teamB: 'USA', isLocked: false, actualA: null, actualB: null },
  { id: "m60", order: 60, group: 'Group Stage - Group D', date: '2026-06-26', time: '05:00', teamA: 'Paraguay', teamB: 'Australia', isLocked: false, actualA: null, actualB: null },
  { id: "m61", order: 61, group: 'Group Stage - Group I', date: '2026-06-26', time: '22:00', teamA: 'Norway', teamB: 'France', isLocked: false, actualA: null, actualB: null },
  { id: "m62", order: 62, group: 'Group Stage - Group I', date: '2026-06-26', time: '22:00', teamA: 'Senegal', teamB: 'Iraq', isLocked: false, actualA: null, actualB: null },
  { id: "m63", order: 63, group: 'Group Stage - Group H', date: '2026-06-27', time: '03:00', teamA: 'Cabo Verde', teamB: 'Saudi Arabia', isLocked: false, actualA: null, actualB: null },
  { id: "m64", order: 64, group: 'Group Stage - Group H', date: '2026-06-27', time: '03:00', teamA: 'Uruguay', teamB: 'Spain', isLocked: false, actualA: null, actualB: null },
  { id: "m65", order: 65, group: 'Group Stage - Group G', date: '2026-06-27', time: '06:00', teamA: 'Egypt', teamB: 'Iran', isLocked: false, actualA: null, actualB: null },
  { id: "m66", order: 66, group: 'Group Stage - Group G', date: '2026-06-27', time: '06:00', teamA: 'New Zealand', teamB: 'Belgium', isLocked: false, actualA: null, actualB: null },
  { id: "m67", order: 67, group: 'Group Stage - Group L', date: '2026-06-28', time: '00:00', teamA: 'Panama', teamB: 'England', isLocked: false, actualA: null, actualB: null },
  { id: "m68", order: 68, group: 'Group Stage - Group L', date: '2026-06-28', time: '00:00', teamA: 'Croatia', teamB: 'Ghana', isLocked: false, actualA: null, actualB: null },
  { id: "m69", order: 69, group: 'Group Stage - Group K', date: '2026-06-28', time: '02:30', teamA: 'Colombia', teamB: 'Portugal', isLocked: false, actualA: null, actualB: null },
  { id: "m70", order: 70, group: 'Group Stage - Group K', date: '2026-06-28', time: '02:30', teamA: 'Congo DR', teamB: 'Uzbekistan', isLocked: false, actualA: null, actualB: null },
  { id: "m71", order: 71, group: 'Group Stage - Group J', date: '2026-06-28', time: '05:00', teamA: 'Algeria', teamB: 'Austria', isLocked: false, actualA: null, actualB: null },
  { id: "m72", order: 72, group: 'Group Stage - Group J', date: '2026-06-28', time: '05:00', teamA: 'Jordan', teamB: 'Argentina', isLocked: false, actualA: null, actualB: null },

  // --- Round of 32 ---
  { id: "m73", order: 73, group: 'Round of 32', date: '2026-06-28', time: '22:00', teamA: 'Runner-up Group A', teamB: 'Runner-up Group B', isLocked: false, actualA: null, actualB: null },
  { id: "m74", order: 74, group: 'Round of 32', date: '2026-06-29', time: '23:30', teamA: 'Winner Group E', teamB: '3rd (A/B/C/D/F)', isLocked: false, actualA: null, actualB: null },
  { id: "m75", order: 75, group: 'Round of 32', date: '2026-06-30', time: '04:00', teamA: 'Winner Group F', teamB: 'Runner-up Group C', isLocked: false, actualA: null, actualB: null },
  { id: "m76", order: 76, group: 'Round of 32', date: '2026-06-29', time: '20:00', teamA: 'Winner Group C', teamB: 'Runner-up Group F', isLocked: false, actualA: null, actualB: null },
  { id: "m77", order: 77, group: 'Round of 32', date: '2026-07-01', time: '00:00', teamA: 'Winner Group I', teamB: '3rd (C/D/F/G/H)', isLocked: false, actualA: null, actualB: null },
  { id: "m78", order: 78, group: 'Round of 32', date: '2026-06-30', time: '20:00', teamA: 'Runner-up Group E', teamB: 'Runner-up Group I', isLocked: false, actualA: null, actualB: null },
  { id: "m79", order: 79, group: 'Round of 32', date: '2026-07-01', time: '04:00', teamA: 'Winner Group A', teamB: '3rd (C/E/F/H/I)', isLocked: false, actualA: null, actualB: null },
  { id: "m80", order: 80, group: 'Round of 32', date: '2026-07-01', time: '19:00', teamA: 'Winner Group L', teamB: '3rd (E/H/I/J/K)', isLocked: false, actualA: null, actualB: null },
  { id: "m81", order: 81, group: 'Round of 32', date: '2026-07-02', time: '03:00', teamA: 'Winner Group D', teamB: '3rd (B/E/F/I/J)', isLocked: false, actualA: null, actualB: null },
  { id: "m82", order: 82, group: 'Round of 32', date: '2026-07-01', time: '23:00', teamA: 'Winner Group G', teamB: '3rd (A/E/H/I/J)', isLocked: false, actualA: null, actualB: null },
  { id: "m83", order: 83, group: 'Round of 32', date: '2026-07-03', time: '02:00', teamA: 'Runner-up Group K', teamB: 'Runner-up Group L', isLocked: false, actualA: null, actualB: null },
  { id: "m84", order: 84, group: 'Round of 32', date: '2026-07-02', time: '22:00', teamA: 'Winner Group H', teamB: 'Runner-up Group J', isLocked: false, actualA: null, actualB: null },
  { id: "m85", order: 85, group: 'Round of 32', date: '2026-07-03', time: '06:00', teamA: 'Winner Group B', teamB: '3rd (E/F/G/I/J)', isLocked: false, actualA: null, actualB: null },
  { id: "m86", order: 86, group: 'Round of 32', date: '2026-07-04', time: '01:00', teamA: 'Winner Group J', teamB: 'Runner-up Group H', isLocked: false, actualA: null, actualB: null },
  { id: "m87", order: 87, group: 'Round of 32', date: '2026-07-04', time: '04:30', teamA: 'Winner Group K', teamB: '3rd (D/E/I/J/L)', isLocked: false, actualA: null, actualB: null },
  { id: "m88", order: 88, group: 'Round of 32', date: '2026-07-03', time: '21:00', teamA: 'Runner-up Group D', teamB: 'Runner-up Group G', isLocked: false, actualA: null, actualB: null },

  // --- Round of 16 ---
  { id: "m89", order: 89, group: 'Round of 16', date: '2026-07-05', time: '00:00', teamA: 'Winner m74', teamB: 'Winner m77', isLocked: false, actualA: null, actualB: null },
  { id: "m90", order: 90, group: 'Round of 16', date: '2026-07-04', time: '20:00', teamA: 'Winner m73', teamB: 'Winner m75', isLocked: false, actualA: null, actualB: null },
  { id: "m91", order: 91, group: 'Round of 16', date: '2026-07-05', time: '23:00', teamA: 'Winner m76', teamB: 'Winner m78', isLocked: false, actualA: null, actualB: null },
  { id: "m92", order: 92, group: 'Round of 16', date: '2026-07-06', time: '03:00', teamA: 'Winner m79', teamB: 'Winner m80', isLocked: false, actualA: null, actualB: null },
  { id: "m93", order: 93, group: 'Round of 16', date: '2026-07-06', time: '22:00', teamA: 'Winner m83', teamB: 'Winner m84', isLocked: false, actualA: null, actualB: null },
  { id: "m94", order: 94, group: 'Round of 16', date: '2026-07-07', time: '03:00', teamA: 'Winner m81', teamB: 'Winner m82', isLocked: false, actualA: null, actualB: null },
  { id: "m95", order: 95, group: 'Round of 16', date: '2026-07-07', time: '19:00', teamA: 'Winner m86', teamB: 'Winner m88', isLocked: false, actualA: null, actualB: null },
  { id: "m96", order: 96, group: 'Round of 16', date: '2026-07-07', time: '23:00', teamA: 'Winner m85', teamB: 'Winner m87', isLocked: false, actualA: null, actualB: null },

  // --- Quarter-finals ---
  { id: "m97", order: 97, group: 'Quarter-finals', date: '2026-07-09', time: '23:00', teamA: 'Winner m89', teamB: 'Winner m90', isLocked: false, actualA: null, actualB: null },
  { id: "m98", order: 98, group: 'Quarter-finals', date: '2026-07-10', time: '22:00', teamA: 'Winner m93', teamB: 'Winner m94', isLocked: false, actualA: null, actualB: null },
  { id: "m99", order: 99, group: 'Quarter-finals', date: '2026-07-12', time: '00:00', teamA: 'Winner m91', teamB: 'Winner m92', isLocked: false, actualA: null, actualB: null },
  { id: "m100", order: 100, group: 'Quarter-finals', date: '2026-07-12', time: '04:00', teamA: 'Winner m95', teamB: 'Winner m96', isLocked: false, actualA: null, actualB: null },

  // --- Semi-finals ---
  { id: "m101", order: 101, group: 'Semi-finals', date: '2026-07-14', time: '22:00', teamA: 'Winner m97', teamB: 'Winner m98', isLocked: false, actualA: null, actualB: null },
  { id: "m102", order: 102, group: 'Semi-finals', date: '2026-07-15', time: '22:00', teamA: 'Winner m99', teamB: 'Winner m100', isLocked: false, actualA: null, actualB: null },

  // --- 3rd Place & Final ---
  { id: "m103", order: 103, group: 'Third Place Play-off', date: '2026-07-18', time: '00:00', teamA: 'Loser m101', teamB: 'Loser m102', isLocked: false, actualA: null, actualB: null },
  { id: "m104", order: 104, group: 'Final', date: '2026-07-19', time: '22:00', teamA: 'Winner m101', teamB: 'Winner m102', isLocked: false, actualA: null, actualB: null }
];

const getBaseCollection = (collectionName) => collection(db, 'artifacts', appId, 'public', 'data', collectionName);
const getBaseDoc = (collectionName, docId) => doc(db, 'artifacts', appId, 'public', 'data', collectionName, docId);

// Time Lock: Automatically locks input when current time hits kickoff (Bahrain GMT+3)
const isMatchStarted = (dateStr, timeStr) => {
  if (!dateStr || !timeStr) return false;
  try {
    const matchDate = new Date(`${dateStr}T${timeStr}:00+03:00`);
    if (isNaN(matchDate)) return false;
    return new Date() >= matchDate;
  } catch (e) { return false; }
};

export default function App() {
  const [firebaseUser, setFirebaseUser] = useState(null);
  const [authChecking, setAuthChecking] = useState(true);
  const [usersData, setUsersData] = useState([]);
  const [dbMatches, setDbMatches] = useState([]); 
  const [predictions, setPredictions] = useState([]);
  const [settings, setSettings] = useState({ actualChampion: null, isRegistrationLocked: false });
  const [activeTab, setActiveTab] = useState('matches');
  const [isAdmin, setIsAdmin] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [activeProfileId, setActiveProfileId] = useState(localStorage.getItem('wc2026_profile_id_en') || null);

  useEffect(() => {
    const initAuth = async () => {
      try {
        if (typeof __initial_auth_token !== 'undefined' && __initial_auth_token) {
          await signInWithCustomToken(auth, __initial_auth_token);
        } else {
          await signInAnonymously(auth);
        }
      } catch (err) {
        console.error("Auth error:", err);
        setErrorMsg("Failed to connect to the database. Please reload.");
        setAuthChecking(false);
      }
    };
    initAuth();

    const unsubscribe = onAuthStateChanged(auth, (u) => {
      setFirebaseUser(u);
      setAuthChecking(false);
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (!firebaseUser) return;

    const unUsers = onSnapshot(getBaseCollection('users'), (snapshot) => {
      const uData = [];
      snapshot.forEach(doc => uData.push({ profileId: doc.id, ...doc.data() }));
      setUsersData(uData);
    });

    const unMatches = onSnapshot(getBaseCollection('matches'), (snapshot) => {
      const mData = [];
      snapshot.forEach(doc => mData.push({ id: doc.id, ...doc.data() }));
      setDbMatches(mData);
    });

    const unPreds = onSnapshot(getBaseCollection('predictions'), (snapshot) => {
      const pData = [];
      snapshot.forEach(doc => pData.push({ id: doc.id, ...doc.data() }));
      setPredictions(pData);
    });

    const unSettings = onSnapshot(getBaseDoc('settings', 'global'), (docSnap) => {
      if (docSnap.exists()) setSettings(docSnap.data());
    });

    return () => { unUsers(); unMatches(); unPreds(); unSettings(); };
  }, [firebaseUser]);

  const matches = useMemo(() => {
    return BASE_MATCHES.map(baseMatch => {
      const dbEdit = dbMatches.find(m => m.id === baseMatch.id);
      return dbEdit ? { ...baseMatch, ...dbEdit } : baseMatch;
    });
  }, [dbMatches]);

  const leaderboardData = useMemo(() => {
    return usersData.map(u => {
      let points = 0; let exact = 0; let outcome = 0;
      const userPreds = predictions.filter(p => p.profileId === u.profileId);

      matches.forEach(match => {
        const p = userPreds.find(pred => pred.matchId === match.id);
        if (!p) return;

        const isKnockout = !match.group.toLowerCase().includes('group');

        if (isKnockout) {
          const hasActual = match.isPk ? !!match.pkWinner : (match.actualA !== null && !isNaN(match.actualA));
          const hasPred = p.isPk ? !!p.pkWinner : (p.scoreA !== '' && p.scoreB !== '' && p.scoreA !== undefined);

          if (hasActual && hasPred) {
            const actualWinner = match.isPk ? match.pkWinner : (parseInt(match.actualA) > parseInt(match.actualB) ? 'A' : 'B');
            const predWinner = p.isPk ? p.pkWinner : (parseInt(p.scoreA) > parseInt(p.scoreB) ? 'A' : 'B');

            const isActualPk = !!match.isPk;
            const isPredPk = !!p.isPk;

            if (!isActualPk && !isPredPk) {
              const pA = parseInt(p.scoreA); const pB = parseInt(p.scoreB);
              const aA = parseInt(match.actualA); const aB = parseInt(match.actualB);
              if (pA === aA && pB === aB) { points += 3; exact += 1; } 
              else if (actualWinner === predWinner) { points += 1; outcome += 1; }
            } else if (isActualPk && isPredPk) {
              if (match.pkWinner === p.pkWinner) { points += 3; exact += 1; }
            } else {
              if (actualWinner === predWinner) { points += 1; outcome += 1; }
            }
          }
        } else {
          // Standard Group Stage System
          if (match.actualA !== undefined && match.actualA !== null && !isNaN(match.actualA)) {
            if (p.scoreA !== '' && p.scoreB !== '') {
              const pA = parseInt(p.scoreA); const pB = parseInt(p.scoreB);
              const aA = parseInt(match.actualA); const aB = parseInt(match.actualB);
              if (pA === aA && pB === aB) { points += 3; exact += 1; } 
              else if ((pA > pB && aA > aB) || (pA < pB && aA < aB) || (pA === pB && aA === aB)) { points += 1; outcome += 1; }
            }
          }
        }
      });


      // Updated Champion Points Logic (10, 7, 5)
      if (settings?.actualChampion) {
        if (u.champion1 === settings.actualChampion) points += 10;
        else if (u.champion2 === settings.actualChampion) points += 7;
        else if (u.champion3 === settings.actualChampion) points += 5;
      }

      return { ...u, points, exact, outcome };
    }).sort((a, b) => b.points - a.points || b.exact - a.exact || b.outcome - a.outcome);
  }, [usersData, matches, predictions, settings]);

  const handleSetProfile = (profileId) => {
    localStorage.setItem('wc2026_profile_id_en', profileId);
    setActiveProfileId(profileId);
  };

  const handleLogout = () => {
    localStorage.removeItem('wc2026_profile_id_en');
    setActiveProfileId(null);
  }

  useEffect(() => {
    if (activeProfileId && usersData.length > 0 && !usersData.find(u => u.profileId === activeProfileId)) {
      handleLogout();
    }
  }, [usersData, activeProfileId]);

  if (authChecking) {
    return <div className="min-h-screen bg-slate-900 flex flex-col items-center justify-center text-emerald-400 gap-4"><Trophy className="w-12 h-12 animate-bounce"/><p>Loading application...</p></div>;
  }

  if (!firebaseUser && errorMsg) {
    return <div className="min-h-screen bg-slate-900 flex items-center justify-center text-red-400 p-6 text-center">{errorMsg}</div>;
  }

  const currentProfile = usersData.find(u => u.profileId === activeProfileId);

  return (
    <div dir="ltr" className="min-h-screen bg-slate-900 text-slate-100 font-sans pb-20 text-left">
      <header className="bg-slate-800 p-4 shadow-md sticky top-0 z-10 border-b border-slate-700">
        <div className="max-w-4xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-2 text-emerald-400">
            <Trophy className="w-6 h-6" />
            <div className="flex flex-col text-left">
              {/* Title size set to text-base */}
              <h1 className="text-base font-bold tracking-tight text-white leading-none">Finance SPA world cup challenge</h1>
            </div>
          </div>
          {currentProfile && (
            <div className="text-sm text-slate-400 flex items-center gap-2">
              <UserCircle className="w-5 h-5" />
              {/* Participant name size explicitly set to text-xs */}
              <span className="text-xs font-medium text-white">{currentProfile.name}</span>
              <button onClick={handleLogout} className="text-xs ml-2 text-slate-500 hover:text-white underline">Logout</button>
            </div>
          )}
        </div>
      </header>

      <main className="max-w-4xl mx-auto p-4">
        {!currentProfile ? (
          <AuthForms onLogin={handleSetProfile} existingUsers={usersData} isRegistrationLocked={settings?.isRegistrationLocked} />
        ) : (
          <div className="animate-in fade-in duration-300">
            {activeTab === 'matches' && <MatchesView matches={matches} predictions={predictions} profileId={currentProfile.profileId} />}
            {activeTab === 'predictions' && <PredictionsView matches={matches} predictions={predictions} usersData={usersData} />}
            {activeTab === 'leaderboard' && <LeaderboardView leaderboardData={leaderboardData} settings={settings} />}
            {activeTab === 'admin' && ADMIN_USERS.includes(currentProfile.name) && (
              <AdminView isAdmin={isAdmin} setIsAdmin={setIsAdmin} matches={matches} settings={settings} passcode={ADMIN_PASSCODE} usersData={usersData} predictions={predictions} />
            )}
          </div>
        )}
      </main>

      {currentProfile && (
        <nav className="fixed bottom-0 left-0 right-0 bg-slate-800 border-t border-slate-700 pb-safe z-20">
          <div className="max-w-4xl mx-auto flex justify-around">
            <NavBtn icon={<CalendarDays className="w-6 h-6" />} label="Matches" active={activeTab === 'matches'} onClick={() => setActiveTab('matches')} />
            <NavBtn icon={<Eye className="w-6 h-6" />} label="Predictions" active={activeTab === 'predictions'} onClick={() => setActiveTab('predictions')} />
            <NavBtn icon={<BarChart3 className="w-6 h-6" />} label="Leaderboard" active={activeTab === 'leaderboard'} onClick={() => setActiveTab('leaderboard')} />
            {ADMIN_USERS.includes(currentProfile.name) && (
              <NavBtn icon={<Settings className="w-6 h-6" />} label="Admin" active={activeTab === 'admin'} onClick={() => setActiveTab('admin')} />
            )}
          </div>
        </nav>
      )}
    </div>
  );
}

function NavBtn({ icon, label, active, onClick }) {
  return (
    <button onClick={onClick} className={`flex-1 flex flex-col items-center py-3 gap-1 transition-colors ${active ? 'text-emerald-400' : 'text-slate-400 hover:text-slate-200'}`}>
      {icon}
      <span className="text-xs font-medium">{label}</span>
    </button>
  );
}

function AuthForms({ onLogin, existingUsers, isRegistrationLocked }) {
  const [mode, setMode] = useState(isRegistrationLocked ? 'login' : 'register');
  const [name, setName] = useState('');
  const [champion1, setChampion1] = useState('');
  const [champion2, setChampion2] = useState('');
  const [champion3, setChampion3] = useState('');
  const [pin, setPin] = useState('');
  const [selectedProfileId, setSelectedProfileId] = useState('');
  const [loginPin, setLoginPin] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleRegister = async (e) => {
    e.preventDefault();
    if (isRegistrationLocked) return;
    if (!name.trim() || !champion1 || !champion2 || !champion3 || pin.length !== 4) {
      setError('Please fill all fields and input a 4-digit PIN.'); return;
    }
    
    // Prevent duplicate selections
    if (champion1 === champion2 || champion1 === champion3 || champion2 === champion3) {
      setError('Please select three DIFFERENT teams for your choices.'); return;
    }

    if (existingUsers.some(u => u.name.trim().toLowerCase() === name.trim().toLowerCase())) {
      setError('Name already taken. Try adding a last name or login.'); return;
    }

    setLoading(true); setError('');
    const newProfileId = 'user_' + Date.now().toString(); 

    try {
      await setDoc(getBaseDoc('users', newProfileId), { 
        name: name.trim(), 
        champion1: champion1, 
        champion2: champion2, 
        champion3: champion3, 
        pin: pin, 
        joinedAt: new Date().toISOString() 
      });
      onLogin(newProfileId);
    } catch (err) { 
      console.error(err); setError("An error occurred during registration.");
    }
    setLoading(false);
  };

  const handleLogin = (e) => {
    e.preventDefault();
    setError('');
    if (!selectedProfileId || loginPin.length !== 4) {
       setError('Select your name and enter your 4-digit PIN.'); return;
    }

    const user = existingUsers.find(u => u.profileId === selectedProfileId);
    if (user && user.pin === loginPin) {
      onLogin(user.profileId);
    } else {
      setError('Incorrect security PIN for this account.');
    }
  }

  return (
    <div className="max-w-md mx-auto mt-10 bg-slate-800 p-6 rounded-2xl shadow-xl border border-slate-700 text-left">
      <div className="text-center mb-6">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-emerald-500/20 text-emerald-400 mb-4">
          <Trophy className="w-8 h-8" />
        </div>
        <h2 className="text-2xl font-bold text-white">Prediction Portal</h2>
      </div>

      <div className="flex bg-slate-900 rounded-lg p-1 mb-6 border border-slate-700">
        <button onClick={() => {setMode('register'); setError('');}} className={`flex-1 py-2 rounded flex justify-center items-center gap-2 text-sm font-bold transition-colors ${mode === 'register' ? 'bg-emerald-500 text-slate-900' : 'text-slate-400 hover:text-white'}`}>
          <UserPlus className="w-4 h-4"/> New Player
        </button>
        <button onClick={() => {setMode('login'); setError('');}} className={`flex-1 py-2 rounded flex justify-center items-center gap-2 text-sm font-bold transition-colors ${mode === 'login' ? 'bg-emerald-500 text-slate-900' : 'text-slate-400 hover:text-white'}`}>
          <LogIn className="w-4 h-4"/> Sign In
        </button>
      </div>

      {error && <div className="bg-red-500/10 border border-red-500/30 text-red-400 p-3 rounded-lg mb-4 text-sm text-center">{error}</div>}

      {mode === 'register' ? (
        isRegistrationLocked ? (
          <div className="bg-yellow-500/10 border border-yellow-500/30 text-yellow-500 p-4 rounded-lg text-center text-sm flex flex-col items-center gap-2">
            <ShieldAlert className="w-6 h-6"/>
            Registration is currently closed by the Admin.
          </div>
        ) : (
          <form onSubmit={handleRegister} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1">Full Name</label>
              <input type="text" required maxLength={30} value={name} onChange={(e) => setName(e.target.value)} className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-3 text-white focus:ring-2 focus:ring-emerald-500 outline-none text-left" placeholder="e.g. Hamad Khalid" />
            </div>
            
            <div className="flex flex-col sm:flex-row gap-2">
              <div className="flex-1">
                <label className="block text-xs font-medium text-slate-300 mb-1">Choice 1 (10 pts)</label>
                <select required value={champion1} onChange={(e) => setChampion1(e.target.value)} className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2 py-3 text-white focus:ring-2 focus:ring-emerald-500 outline-none text-xs">
                  <option value="" disabled>Select...</option>
                  {ALL_48_TEAMS.map(team => <option key={team} value={team}>{team}</option>)}
                </select>
              </div>
              <div className="flex-1">
                <label className="block text-xs font-medium text-slate-300 mb-1">Choice 2 (7 pts)</label>
                <select required value={champion2} onChange={(e) => setChampion2(e.target.value)} className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2 py-3 text-white focus:ring-2 focus:ring-emerald-500 outline-none text-xs">
                  <option value="" disabled>Select...</option>
                  {ALL_48_TEAMS.map(team => <option key={team} value={team}>{team}</option>)}
                </select>
              </div>
              <div className="flex-1">
                <label className="block text-xs font-medium text-slate-300 mb-1">Choice 3 (5 pts)</label>
                <select required value={champion3} onChange={(e) => setChampion3(e.target.value)} className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2 py-3 text-white focus:ring-2 focus:ring-emerald-500 outline-none text-xs">
                  <option value="" disabled>Select...</option>
                  {ALL_48_TEAMS.map(team => <option key={team} value={team}>{team}</option>)}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1">Create a Security PIN (4 digits)</label>
              <input type="password" required maxLength={4} pattern="\d{4}" value={pin} onChange={(e) => setPin(e.target.value)} className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-3 text-white focus:ring-2 focus:ring-emerald-500 outline-none text-center tracking-widest text-lg" placeholder="1234" />
              <p className="text-xs text-slate-500 mt-1 text-left">* Keep this PIN safe to log back in from other devices.</p>
            </div>
            <button disabled={loading} type="submit" className="w-full bg-emerald-500 hover:bg-emerald-600 text-slate-900 font-bold rounded-lg px-4 py-3 mt-4 transition">
              {loading ? 'Registering...' : 'Create Account'}
            </button>
          </form>
        )
      ) : (
        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1">Select Your Name</label>
            <select required value={selectedProfileId} onChange={(e) => setSelectedProfileId(e.target.value)} className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-3 text-white focus:ring-2 focus:ring-emerald-500 outline-none appearance-none text-left">
              <option value="" disabled>Search your name...</option>
              {existingUsers.map(u => <option key={u.profileId} value={u.profileId}>{u.name}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1">Enter Security PIN</label>
            <input type="password" required maxLength={4} value={loginPin} onChange={(e) => setLoginPin(e.target.value)} className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-3 text-white focus:ring-2 focus:ring-emerald-500 outline-none text-center tracking-widest text-lg" placeholder="••••" />
          </div>
          <button type="submit" className="w-full bg-slate-700 hover:bg-slate-600 text-white font-bold rounded-lg px-4 py-3 mt-4 transition">
            Access Dashboard
          </button>
        </form>
      )}
    </div>
  );
}

function MatchesView({ matches, predictions, profileId }) {
  const [filter, setFilter] = useState('active'); 
  
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  
  const defaultFilters = {
    time: [],   
    team: [],   
    stage: [],  
    points: []  
  };
  const [advFilters, setAdvFilters] = useState(defaultFilters);
  
  const [openDropdown, setOpenDropdown] = useState(null); 

  // Extracts teams only from Group Stage matches to avoid "Winner of..." duplicates
  const allTeams = [...new Set(
    matches.filter(m => m.group.includes('Group')).flatMap(m => [m.teamA, m.teamB])
  )].filter(team => team).sort();

  const stages = ['Group Stage', 'Round of 32', 'Round of 16', 'Quarter-Finals', 'Semi-Finals', 'Third Place', 'Final'];

  const getMatchPointsForFilter = (match) => {
    const isCompleted = (match.actualA !== null && match.actualA !== undefined && match.actualA !== '') || match.isPk === true;
    if (!isCompleted) return null;
    
    // Strict check for profileId to prevent data bleed
    const userPred = predictions.find(p => p.matchId === match.id && p.profileId === profileId);
    
    if (!userPred) return 0;

    let earnedPoints = 0;
    if (!match.isPk && !userPred.isPk) {
      const pA = parseInt(userPred.scoreA); const pB = parseInt(userPred.scoreB);
      const aA = parseInt(match.actualA); const aB = parseInt(match.actualB);
      if (pA === aA && pB === aB) earnedPoints = 3;
      else if ((pA > pB && aA > aB) || (pA < pB && aA < aB) || (pA === pB && aA === aB)) earnedPoints = 1;
    } else if (match.isPk && userPred.isPk) {
      if (match.pkWinner === userPred.pkWinner) earnedPoints = 3;
    } else {
      const actualWinner = match.isPk ? match.pkWinner : (parseInt(match.actualA) > parseInt(match.actualB) ? 'A' : 'B');
      const predWinner = userPred.isPk ? userPred.pkWinner : (parseInt(userPred.scoreA) > parseInt(userPred.scoreB) ? 'A' : 'B');
      if (actualWinner === predWinner) earnedPoints = 1;
    }
    return earnedPoints;
  };

  // Calculate active filters before filtering the matches
  const activeFiltersCount = advFilters.time.length + advFilters.team.length + advFilters.stage.length + advFilters.points.length;

  const filteredMatches = matches.filter(match => {
    const isCompleted = (match.actualA !== null && match.actualA !== undefined && match.actualA !== '') || match.isPk === true;
    const isPastKickoff = isMatchStarted(match.date, match.time);
    const isOngoing = isPastKickoff && !isCompleted;
    const today = new Date().toDateString();
    const matchDateStr = new Date(match.date).toDateString();

    // Ignore Quick Filters if the advanced menu is open, or if advanced filters are in use
    if (!isFilterOpen && activeFiltersCount === 0) {
      if (filter === 'active' && (isCompleted || isOngoing)) return false;
      if (filter === 'today' && today !== matchDateStr) return false;
    }

    // Advanced Filters
    if (advFilters.time.length > 0) {
      let matchesTime = false;
      if (advFilters.time.includes('Ongoing') && isOngoing) matchesTime = true;
      if (advFilters.time.includes('Finished') && isCompleted) matchesTime = true;
      if (advFilters.time.includes('Upcoming') && !isPastKickoff && !isCompleted) matchesTime = true;
      if (!matchesTime) return false;
    }
    
    if (advFilters.team.length > 0) {
      if (!advFilters.team.includes(match.teamA) && !advFilters.team.includes(match.teamB)) return false;
    }
    
    if (advFilters.stage.length > 0) {
      let matchesStage = false;
      advFilters.stage.forEach(s => {
        if (s === 'Round of 32' && match.group.includes('32')) matchesStage = true;
        else if (s === 'Round of 16' && match.group.includes('16')) matchesStage = true;
        else if (s === 'Group Stage' && match.group.includes('Group')) matchesStage = true;
        else if (s !== 'Round of 32' && s !== 'Round of 16' && s !== 'Group Stage' && match.group.includes(s)) matchesStage = true;
      });
      if (!matchesStage) return false;
    }

    if (advFilters.points.length > 0) {
      const pts = getMatchPointsForFilter(match);
      if (pts === null) return false; 
      if (!advFilters.points.includes(`+${pts}`)) return false;
    }

    return true;
  });

  const groupedMatches = filteredMatches.reduce((groups, match) => {
    const date = match.date;
    if (!groups[date]) groups[date] = [];
    groups[date].push(match);
    return groups;
  }, {});

  const formatDate = (dateStr) => {
    try {
      const dObj = new Date(dateStr);
      if (isNaN(dObj)) return dateStr;
      return new Intl.DateTimeFormat('en-US', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' }).format(dObj);
    } catch(e) { return dateStr; }
  };

  const handleQuickFilter = (f) => {
    setFilter(f);
    setAdvFilters(defaultFilters);
  };

  const applyAdvancedFilters = () => {
    setIsFilterOpen(false);
    setFilter('all');
  };

  const toggleFilter = (category, value) => {
    setAdvFilters(prev => {
      const current = prev[category];
      if (current.includes(value)) {
        return { ...prev, [category]: current.filter(item => item !== value) };
      } else {
        return { ...prev, [category]: [...current, value] };
      }
    });
  };

  const renderTags = (category) => {
    if (advFilters[category].length === 0) return null;
    return (
      <div className="flex flex-wrap gap-1.5 mt-2">
        {advFilters[category].map(val => (
          <span key={val} className="inline-flex items-center gap-1 px-2 py-1 bg-emerald-500/20 text-emerald-400 text-[10px] font-bold rounded border border-emerald-500/30">
            {val}
            <button onClick={(e) => { e.stopPropagation(); toggleFilter(category, val); }} className="hover:text-white bg-slate-900/50 rounded-full w-4 h-4 flex items-center justify-center transition-colors">&times;</button>
          </span>
        ))}
      </div>
    );
  };

  return (
    <div className="space-y-6 text-left">
      <div className="flex justify-between items-start mb-2">
        <div>
          <h2 className="text-xl font-bold text-white mb-1">Match Predictions</h2>
          <p className="text-xs text-slate-400 mb-2">View all 104 tournament matches in detail</p>
          <div className="inline-flex items-center gap-1.5 bg-emerald-500/10 text-emerald-400 px-2.5 py-1 rounded-md text-xs font-mono font-bold">
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>
            Bahrain Time (GMT+3)
          </div>
        </div>
        
        <button 
          onClick={() => setIsFilterOpen(true)}
          className="flex items-center gap-1.5 bg-slate-800 hover:bg-slate-700 border border-slate-600 text-white px-3 py-2 rounded-lg text-xs font-bold transition shadow-md mt-1"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"/></svg>
          Advanced Filter
          {activeFiltersCount > 0 && (
            <span className="bg-emerald-500 text-slate-950 px-1.5 py-0.5 rounded text-[10px] font-black">
              {activeFiltersCount}
            </span>
          )}
        </button>
      </div>

      <div className="flex bg-slate-800 p-1 rounded-xl mb-6 border border-slate-700 shadow-inner">
        <button onClick={() => handleQuickFilter('active')} className={`flex-1 text-xs sm:text-sm font-bold py-2.5 rounded-lg transition ${filter === 'active' ? 'bg-emerald-500 text-slate-950 shadow' : 'text-slate-400 hover:text-white hover:bg-slate-700/50'}`}>Hide Finished</button>
        <button onClick={() => handleQuickFilter('today')} className={`flex-1 text-xs sm:text-sm font-bold py-2.5 rounded-lg transition ${filter === 'today' ? 'bg-emerald-500 text-slate-950 shadow' : 'text-slate-400 hover:text-white hover:bg-slate-700/50'}`}>Today's Matches</button>
        <button onClick={() => handleQuickFilter('all')} className={`flex-1 text-xs sm:text-sm font-bold py-2.5 rounded-lg transition ${filter === 'all' ? 'bg-emerald-500 text-slate-950 shadow' : 'text-slate-400 hover:text-white hover:bg-slate-700/50'}`}>Show All</button>
      </div>

      {isFilterOpen && (
        <div className="fixed inset-0 bg-slate-950/85 flex items-center justify-center z-50 p-4 backdrop-blur-sm overflow-hidden">
          <div className="bg-slate-800 border border-slate-600 rounded-2xl p-5 w-full max-w-sm shadow-2xl flex flex-col max-h-[90vh]">
            <div className="flex justify-between items-center mb-4 border-b border-slate-700 pb-3 shrink-0">
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-emerald-400"><polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"/></svg>
                Advanced Customization
              </h3>
              <button onClick={() => setIsFilterOpen(false)} className="text-slate-400 hover:text-white transition bg-slate-700/50 p-1.5 rounded-lg">
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
              </button>
            </div>

            <div className="overflow-y-auto pr-1 space-y-5 flex-1 custom-scrollbar">
              <div>
                <label className="block text-xs font-bold text-slate-400 mb-2">Match Status (Multi-select)</label>
                <div className="flex gap-2">
                  {['Ongoing', 'Finished', 'Upcoming'].map(t => (
                    <button key={t} onClick={() => toggleFilter('time', t)} className={`flex-1 py-2 rounded-lg text-xs font-bold transition border ${advFilters.time.includes(t) ? 'bg-emerald-500/20 border-emerald-500/50 text-emerald-400' : 'bg-slate-900 border-slate-700 text-slate-400 hover:bg-slate-800'}`}>
                      {t}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-400 mb-2">Target Teams</label>
                <div 
                  onClick={() => setOpenDropdown(openDropdown === 'team' ? null : 'team')}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2.5 text-white text-sm font-medium cursor-pointer flex justify-between items-center transition hover:bg-slate-800"
                >
                  <span className={advFilters.team.length > 0 ? 'text-white' : 'text-slate-500'}>
                    {advFilters.team.length > 0 ? `${advFilters.team.length} Teams Selected` : 'Select Teams...'}
                  </span>
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={`transition-transform duration-200 ${openDropdown === 'team' ? 'rotate-180' : ''}`}><polyline points="6 9 12 15 18 9"></polyline></svg>
                </div>
                {renderTags('team')}
                
                {openDropdown === 'team' && (
                  <div className="mt-2 bg-slate-900 border border-slate-700 rounded-lg max-h-48 overflow-y-auto p-2 grid grid-cols-2 gap-1 shadow-inner">
                    {allTeams.map(team => (
                      <label key={team} className="flex items-center gap-2 p-2 hover:bg-slate-800 rounded cursor-pointer transition">
                        <input type="checkbox" checked={advFilters.team.includes(team)} onChange={() => toggleFilter('team', team)} className="accent-emerald-500 w-4 h-4 rounded" />
                        <span className="text-sm text-slate-300">{team}</span>
                      </label>
                    ))}
                  </div>
                )}
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-400 mb-2">Tournament Stages</label>
                <div 
                  onClick={() => setOpenDropdown(openDropdown === 'stage' ? null : 'stage')}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2.5 text-white text-sm font-medium cursor-pointer flex justify-between items-center transition hover:bg-slate-800"
                >
                  <span className={advFilters.stage.length > 0 ? 'text-white' : 'text-slate-500'}>
                    {advFilters.stage.length > 0 ? `${advFilters.stage.length} Stages Selected` : 'Select Stages...'}
                  </span>
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={`transition-transform duration-200 ${openDropdown === 'stage' ? 'rotate-180' : ''}`}><polyline points="6 9 12 15 18 9"></polyline></svg>
                </div>
                {renderTags('stage')}

                {openDropdown === 'stage' && (
                  <div className="mt-2 bg-slate-900 border border-slate-700 rounded-lg p-2 grid grid-cols-1 gap-1 shadow-inner">
                    {stages.map(stage => (
                      <label key={stage} className="flex items-center gap-2 p-2 hover:bg-slate-800 rounded cursor-pointer transition">
                        <input type="checkbox" checked={advFilters.stage.includes(stage)} onChange={() => toggleFilter('stage', stage)} className="accent-emerald-500 w-4 h-4 rounded" />
                        <span className="text-sm text-slate-300">{stage}</span>
                      </label>
                    ))}
                  </div>
                )}
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-400 mb-2">Points Earned from Prediction</label>
                <div className="flex gap-2">
                  {['+3', '+1', '+0'].map(p => (
                    <button key={p} onClick={() => toggleFilter('points', p)} className={`flex-1 py-2 rounded-lg text-sm font-bold transition border ${advFilters.points.includes(p) ? 'bg-emerald-500/20 border-emerald-500/50 text-emerald-400' : 'bg-slate-900 border-slate-700 text-slate-400 hover:bg-slate-800'}`}>
                      {p}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="mt-5 pt-4 border-t border-slate-700 flex gap-3 shrink-0">
              <button 
                onClick={applyAdvancedFilters} 
                className="flex-1 bg-emerald-500 text-slate-950 font-bold py-3 rounded-lg text-sm hover:bg-emerald-400 transition shadow-lg shadow-emerald-500/20"
              >
                Apply Filter ({filteredMatches.length} matches)
              </button>
              <button 
                onClick={() => setAdvFilters(defaultFilters)} 
                className="px-4 bg-slate-700 text-slate-300 font-bold rounded-lg text-sm hover:bg-slate-600 transition border border-slate-600"
              >
                Reset
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="space-y-6">
        {Object.keys(groupedMatches).length > 0 ? (
          Object.keys(groupedMatches).map(date => (
            <div key={date}>
              <div className="inline-block bg-slate-800 border border-slate-700 text-slate-300 text-sm font-bold px-4 py-1.5 rounded-lg mb-4">
                {formatDate(date)}
              </div>
              <div className="space-y-4">
                {groupedMatches[date].map(match => {
                  // Strict profileId check before rendering the card
                  const userPred = predictions.find(p => p.matchId === match.id && p.profileId === profileId);
                  return <MatchCard key={match.id} match={match} userPred={userPred} profileId={profileId} />;
                })}
              </div>
            </div>
          ))
        ) : (
          <div className="text-center py-12 bg-slate-800 rounded-xl border border-slate-700 shadow-inner">
            <p className="text-slate-400 font-bold">No matches match the selected filters.</p>
          </div>
        )}
      </div>
    </div>
  );
}



function MatchCard({ match, userPred, profileId }) {
  const [scoreA, setScoreA] = useState(userPred?.scoreA ?? '');
  const [scoreB, setScoreB] = useState(userPred?.scoreB ?? '');
  const [isPk, setIsPk] = useState(userPred?.isPk ?? false);
  const [pkWinner, setPkWinner] = useState(userPred?.pkWinner ?? '');
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const isKnockout = !match.group.toLowerCase().includes('group');

  useEffect(() => {
    setScoreA(userPred?.scoreA ?? '');
    setScoreB(userPred?.scoreB ?? '');
    setIsPk(userPred?.isPk ?? false);
    setPkWinner(userPred?.pkWinner ?? '');
  }, [userPred]);

  // FIXED: Added nullish coalescing (??) for isPk and pkWinner to prevent false positives
  const hasChanges = isKnockout 
    ? ((userPred?.isPk ?? false) !== isPk || (userPred?.pkWinner ?? '') !== pkWinner || (userPred?.scoreA ?? '') !== scoreA || (userPred?.scoreB ?? '') !== scoreB)
    : ((userPred?.scoreA ?? '') !== scoreA || (userPred?.scoreB ?? '') !== scoreB);

  const handleSave = async () => {
    if (isKnockout) {
      if (!isPk && (scoreA === '' || scoreB === '')) return;
      if (!isPk && parseInt(scoreA) === parseInt(scoreB)) {
        alert("Draws are not allowed in knockout stages! Please select a winner or use the penalty shoot-out option.");
        return;
      }
      if (isPk && !pkWinner) {
        alert("Please select the penalty shoot-out winner before saving.");
        return;
      }
    } else {
      if (scoreA === '' || scoreB === '') return;
    }

    setSaving(true);
    const predId = `${profileId}_${match.id}`;
    try {
      await setDoc(getBaseDoc('predictions', predId), { 
        profileId, 
        matchId: match.id, 
        scoreA: isPk ? null : (scoreA !== '' ? parseInt(scoreA) : ''), 
        scoreB: isPk ? null : (scoreB !== '' ? parseInt(scoreB) : ''),
        isPk: isKnockout ? isPk : false,
        pkWinner: (isKnockout && isPk) ? pkWinner : null
      });
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch (err) { console.error(err); }
    setSaving(false);
  };

  const isCompleted = (match.actualA !== null && match.actualA !== undefined && match.actualA !== '') || match.isPk === true;
  const isPastKickoff = isMatchStarted(match.date, match.time);
  const isLockedForUser = match.isLocked || isCompleted || isPastKickoff;

  let earnedPoints = null;
  if (isCompleted && userPred) {
    if (!match.isPk && !userPred.isPk) {
      // 1. Both predicted a normal match (standard group stage logic)
      const pA = parseInt(userPred.scoreA); const pB = parseInt(userPred.scoreB);
      const aA = parseInt(match.actualA); const aB = parseInt(match.actualB);
      
      if (pA === aA && pB === aB) earnedPoints = 3;
      else if ((pA > pB && aA > aB) || (pA < pB && aA < aB) || (pA === pB && aA === aB)) earnedPoints = 1;
      else earnedPoints = 0;
    } else if (match.isPk && userPred.isPk) {
      // 2. Both predicted penalty shoot-outs
      if (match.pkWinner === userPred.pkWinner) earnedPoints = 3;
      else earnedPoints = 0;
    } else {
      // 3. One predicted PKs, the other predicted a normal score (Knockout stages cross-check)
      const actualWinner = match.isPk ? match.pkWinner : (parseInt(match.actualA) > parseInt(match.actualB) ? 'A' : 'B');
      const predWinner = userPred.isPk ? userPred.pkWinner : (parseInt(userPred.scoreA) > parseInt(userPred.scoreB) ? 'A' : 'B');
      
      if (actualWinner === predWinner) earnedPoints = 1;
      else earnedPoints = 0;
    }
  }


  return (
    <div className={`bg-slate-800 rounded-xl p-4 shadow-sm border text-left ${isCompleted ? 'border-slate-600/50 opacity-80' : 'border-slate-700'}`}>
      <div className="flex justify-between items-center text-xs text-slate-400 mb-3 font-medium">
        <span>{match.group} (M{match.order})</span>
        <span className="font-mono">{match.time}</span>
      </div>

      {isKnockout && !isCompleted && (
        <label className="flex items-center gap-2 mb-3 bg-slate-900/50 p-2 rounded-lg cursor-pointer border border-slate-700/50 select-none w-fit ml-auto">
          <span className="text-xs text-slate-300">Penalty shoot-out</span>
          <input type="checkbox" checked={isPk} disabled={isLockedForUser} onChange={(e) => { setIsPk(e.target.checked); if(!e.target.checked) setPkWinner(''); }} className="accent-emerald-500 rounded" />
        </label>
      )}

      {isPk ? (
        <div className="bg-slate-900/60 p-3 rounded-lg border border-emerald-500/20 text-center my-2">
          <p className="text-xs text-slate-400 mb-2">Select the team advancing via penalties:</p>
          <div className="flex justify-center gap-3">
            <button disabled={isLockedForUser} onClick={() => setPkWinner('A')} className={`flex-1 py-2 px-3 text-xs font-bold rounded-lg border transition ${pkWinner === 'A' ? 'bg-emerald-500 text-slate-950 border-emerald-400' : 'bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-700'}`}>{match.teamA}</button>
            <button disabled={isLockedForUser} onClick={() => setPkWinner('B')} className={`flex-1 py-2 px-3 text-xs font-bold rounded-lg border transition ${pkWinner === 'B' ? 'bg-emerald-500 text-slate-950 border-emerald-400' : 'bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-700'}`}>{match.teamB}</button>
          </div>
        </div>
      ) : (
        <div className="flex items-center justify-between mb-4">
          <div className="flex-1 text-center min-w-0">
            <div className="font-bold text-sm sm:text-base text-white mb-2 truncate px-1">{match.teamA}</div>
            <input type="number" min="0" max="20" value={scoreA} onChange={(e) => setScoreA(e.target.value)} disabled={isLockedForUser} className="w-12 h-12 sm:w-14 sm:h-14 bg-slate-900 border border-slate-600 rounded-lg text-center text-xl sm:text-2xl font-bold text-white disabled:opacity-50 focus:ring-2 focus:ring-emerald-500 outline-none" />
          </div>
          <div className="px-1 text-slate-500 font-bold mt-8 text-sm shrink-0">VS</div>
          <div className="flex-1 text-center min-w-0">
            <div className="font-bold text-sm sm:text-base text-white mb-2 truncate px-1">{match.teamB}</div>
            <input type="number" min="0" max="20" value={scoreB} onChange={(e) => setScoreB(e.target.value)} disabled={isLockedForUser} className="w-12 h-12 sm:w-14 sm:h-14 bg-slate-900 border border-slate-600 rounded-lg text-center text-xl sm:text-2xl font-bold text-white disabled:opacity-50 focus:ring-2 focus:ring-emerald-500 outline-none" />
          </div>
        </div>
      )}

      <div className="mt-4 pt-4 border-t border-slate-700/50 flex justify-between items-center h-10">
        {isCompleted ? (
          <div className="w-full flex justify-between items-center">
            {/* Left Side: Result */}
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium text-slate-400">Result:</span>
              {match.isPk ? (
                <span className="text-xs bg-emerald-500/10 text-emerald-400 px-2 py-1 rounded font-bold">Penalties (Won: {match.pkWinner === 'A' ? match.teamA : match.teamB})</span>
              ) : (
                <div className="flex items-center gap-1.5 text-white font-bold">
                  <span className="w-4 text-center">{match.actualA}</span>
                  <span className="text-slate-500">-</span>
                  <span className="w-4 text-center">{match.actualB}</span>
                </div>
              )}
            </div>
            
            {/* Right Side: Points */}
            <div>
              {earnedPoints !== null && (
                <span className={`text-sm font-bold px-2 py-1 rounded ${earnedPoints === 3 ? 'bg-emerald-500/20 text-emerald-400' : earnedPoints === 1 ? 'bg-blue-500/20 text-blue-400' : 'bg-slate-700 text-slate-400'}`}>
                  +{earnedPoints} Pts
                </span>
              )}
            </div>
          </div>
        ) : (
          <div className="w-full flex justify-between items-center">
             {/* Left Side: Status */}
             <div>
               {(match.isLocked || isPastKickoff) ? (
                 <span className="text-sm text-yellow-500 flex items-center gap-1"><Lock className="w-4 h-4"/> Locked</span>
               ) : (
                 <span className="text-xs text-slate-500">Awaiting Kickoff</span>
               )}
             </div>

             {/* Right Side: Save Button */}
             <div>
               {!isLockedForUser && (
                 <button onClick={handleSave} disabled={saving || !hasChanges} className={`flex items-center gap-1 px-4 py-2 rounded-lg text-sm font-bold transition ${saved ? 'bg-emerald-500/20 text-emerald-400' : hasChanges ? 'bg-emerald-500 text-slate-950 shadow-md' : 'bg-slate-700 text-slate-400 cursor-not-allowed'}`}>
                   {saving ? 'Saving...' : saved ? <><Check className="w-4 h-4"/> Saved</> : <><Save className="w-4 h-4"/> Save</>}
                 </button>
               )}
             </div>
          </div>
        )}
      </div>
    </div>
  );
}


function PredictionsView({ matches, predictions, usersData }) {
  // State to keep track of the currently selected match from the dropdown
  const [selectedMatchId, setSelectedMatchId] = useState('');
  
  const now = new Date();
  
  // 1. Filter matches that kicked off within the last 12 hours
  const recentMatches = matches.filter(match => {
    if (!match.date || !match.time) return false;
    try {
      const matchDate = new Date(`${match.date}T${match.time}:00+03:00`);
      if (isNaN(matchDate)) return false;
      
      const twelveHoursLater = new Date(matchDate.getTime() + (12 * 60 * 60 * 1000));
      return now >= matchDate && now <= twelveHoursLater;
    } catch (e) { return false; }
  }).sort((a, b) => {
    // Sort from newest to oldest
    const dateA = new Date(`${a.date}T${a.time}:00+03:00`).getTime();
    const dateB = new Date(`${b.date}T${b.time}:00+03:00`).getTime();
    return dateB - dateA; 
  });

  // Automatically select the newest match when the component loads
  useEffect(() => {
    if (recentMatches.length > 0) {
      if (!selectedMatchId || !recentMatches.find(m => m.id === selectedMatchId)) {
        setSelectedMatchId(recentMatches[0].id);
      }
    }
  }, [recentMatches, selectedMatchId]);

  if (recentMatches.length === 0) {
    return (
      <div className="bg-slate-800 border border-slate-700 rounded-2xl p-12 text-center text-slate-400 shadow-md">
        <Eye className="w-12 h-12 text-slate-600 mx-auto mb-3" />
        <p className="text-base font-bold text-white">No matches in the last 12 hours</p>
        <p className="text-xs text-slate-500 mt-1">Predictions of all participants will appear here for ongoing and recently finished matches to ensure transparency.</p>
      </div>
    );
  }

  // The match currently being displayed and check if it has a final result
  const selectedMatch = recentMatches.find(m => m.id === selectedMatchId) || recentMatches[0];
  const isCompleted = (selectedMatch.actualA !== null && selectedMatch.actualA !== undefined && selectedMatch.actualA !== '') || selectedMatch.isPk === true;
  
  let displayDate = selectedMatch.date;
  try {
    const dObj = new Date(selectedMatch.date);
    if (!isNaN(dObj)) {
      displayDate = new Intl.DateTimeFormat('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' }).format(dObj);
    }
  } catch(e) {}

  return (
    <div className="space-y-6 text-left">
      <div className="mb-4">
        <h2 className="text-xl font-bold text-white">Prediction Transparency</h2>
        <p className="text-xs text-slate-400">View everyone's predictions for matches that started within the last 12 hours.</p>
      </div>

      {/* Dropdown menu to select the match */}
      <div className="bg-slate-800 p-4 rounded-xl border border-slate-700 shadow-md">
        <label className="block text-sm font-bold text-slate-400 mb-2">Select a match to view predictions:</label>
        <select 
          value={selectedMatchId} 
          onChange={(e) => setSelectedMatchId(e.target.value)}
          className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-3 text-white outline-none focus:border-emerald-500 text-sm font-bold cursor-pointer"
        >
          {recentMatches.map(m => (
            <option key={m.id} value={m.id}>
              {m.teamA} VS {m.teamB}
            </option>
          ))}
        </select>
      </div>
      
      {/* The Prediction Table for the selected match */}
      {selectedMatch && (
        <div className="bg-slate-800 rounded-xl overflow-hidden shadow-lg border border-slate-700 mb-6">
        <div className="bg-slate-900 p-4 border-b border-slate-700 text-center flex flex-col items-center">
          <p className="text-xs text-emerald-400 font-mono mb-1">{displayDate} - {selectedMatch.time} • {selectedMatch.group}</p>
          <h3 className="text-lg font-bold text-white">{selectedMatch.teamA} VS {selectedMatch.teamB}</h3>
          
          {/* Final result appears here only if the match is completed */}
          {isCompleted && (
            <div className="mt-2 flex items-center justify-center gap-2 text-sm">
              <span className="text-slate-400 font-medium">Full Time:</span>
              {selectedMatch.isPk ? (
                <span className="text-emerald-400 font-bold bg-emerald-500/10 px-2 py-0.5 rounded text-xs">
                  Penalties (Won: {selectedMatch.pkWinner === 'A' ? selectedMatch.teamA : selectedMatch.teamB})
                </span>
              ) : (
                <div className="flex items-center gap-2 text-emerald-400 font-bold bg-emerald-500/10 px-3 py-0.5 rounded">
                  <span>{selectedMatch.actualA}</span>
                  <span className="text-emerald-500/50">-</span>
                  <span>{selectedMatch.actualB}</span>
                </div>
              )}
            </div>
          )}
        </div>

          
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-center">
              <thead className="bg-slate-800/50 text-slate-400 font-bold border-b border-slate-700">
                <tr>
                  <th className="p-3 text-left">Player Name</th>
                  <th className="p-3 text-center">{selectedMatch.teamA}</th>
                  <th className="p-3 text-center">{selectedMatch.teamB}</th>
                  <th className="p-3 text-center w-24">Pts</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-700/50 text-white">
                {usersData.map(user => {
                  const pred = predictions.find(p => p.profileId === user.profileId && p.matchId === selectedMatch.id);
                  
                  let displayA = '-';
                  let displayB = '-';
                  let isPkText = false;
                  let earnedPoints = null;

                  if (pred) {
                    if (pred.isPk) {
                      isPkText = true;
                      displayA = pred.pkWinner === 'A' ? 'Advances (PK)' : 'Loss';
                      displayB = pred.pkWinner === 'B' ? 'Advances (PK)' : 'Loss';
                    } else if (pred.scoreA !== '' && pred.scoreB !== '' && pred.scoreA !== undefined) {
                      displayA = pred.scoreA;
                      displayB = pred.scoreB;
                    }

                    // Calculate points only if the admin has entered the final result
                    if (isCompleted) {
                      if (!selectedMatch.isPk && !pred.isPk) {
                        const pA = parseInt(pred.scoreA); const pB = parseInt(pred.scoreB);
                        const aA = parseInt(selectedMatch.actualA); const aB = parseInt(selectedMatch.actualB);
                        if (pA === aA && pB === aB) earnedPoints = 3;
                        else if ((pA > pB && aA > aB) || (pA < pB && aA < aB) || (pA === pB && aA === aB)) earnedPoints = 1;
                        else earnedPoints = 0;
                      } else if (selectedMatch.isPk && pred.isPk) {
                        if (selectedMatch.pkWinner === pred.pkWinner) earnedPoints = 3;
                        else earnedPoints = 0;
                      } else {
                        const actualWinner = selectedMatch.isPk ? selectedMatch.pkWinner : (parseInt(selectedMatch.actualA) > parseInt(selectedMatch.actualB) ? 'A' : 'B');
                        const predWinner = pred.isPk ? pred.pkWinner : (parseInt(pred.scoreA) > parseInt(pred.scoreB) ? 'A' : 'B');
                        if (actualWinner === predWinner) earnedPoints = 1;
                        else earnedPoints = 0;
                      }
                    }
                  } else {
                    // If match is finished and user made no prediction, they get 0
                    if (isCompleted) earnedPoints = 0;
                  }
                  
                  return (
                    <tr key={user.profileId} className="hover:bg-slate-700/20 transition">
                      <td className="p-3 text-left font-medium">{user.name}</td>
                      <td className={`p-3 font-bold ${isPkText ? (pred?.pkWinner === 'A' ? 'text-emerald-400 text-xs' : 'text-slate-500 text-xs') : 'text-emerald-400'}`}>
                        {displayA}
                      </td>
                      <td className={`p-3 font-bold ${isPkText ? (pred?.pkWinner === 'B' ? 'text-emerald-400 text-xs' : 'text-slate-500 text-xs') : 'text-emerald-400'}`}>
                        {displayB}
                      </td>
                      {/* Newly added Points column with color-coded badges */}
                      <td className="p-3 text-center font-bold">
                        {earnedPoints !== null ? (
                          <span className={`text-xs font-bold px-2.5 py-1 rounded inline-block min-w-[38px] ${earnedPoints === 3 ? 'bg-emerald-500/20 text-emerald-400' : earnedPoints === 1 ? 'bg-blue-500/20 text-blue-400' : 'bg-slate-700 text-slate-400'}`}>
                            +{earnedPoints}
                          </span>
                        ) : (
                          <span className="text-slate-500 font-medium">-</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}




function LeaderboardView({ leaderboardData, settings }) {
  return (
    <div className="space-y-4 text-left">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4 gap-2">
        <h2 className="text-xl font-bold text-white">Live Leaderboard</h2>
        <div className="text-xs text-slate-400 bg-slate-800 px-3 py-1.5 rounded-full border border-slate-700">
          Points: Exact (3) • Winner (1) • Champ (10/7/5)
        </div>
      </div>

      {settings?.actualChampion && (
        <div className="bg-yellow-500/10 border border-yellow-500/30 p-3 rounded-lg mb-4 flex items-center justify-between">
          <div className="text-left">
            <p className="text-sm text-yellow-500/80 font-medium">Official Tournament Champion</p>
            <p className="text-lg text-yellow-500 font-bold">{settings.actualChampion}</p>
          </div>
          <Trophy className="w-6 h-6 text-yellow-500" />
        </div>
      )}

      <div className="bg-slate-800 rounded-xl overflow-hidden shadow-lg border border-slate-700">
        <div className="grid grid-cols-12 gap-2 p-3 border-b border-slate-700 text-xs font-bold text-slate-400 uppercase tracking-wider bg-slate-800/50">
          <div className="col-span-2 text-center">Rank</div>
          <div className="col-span-6 text-left">Player</div>
          <div className="col-span-2 text-center" title="Exact Match Score / Correct Match Winner">M.Pts</div>
          <div className="col-span-2 text-center">Total</div>
        </div>
        
        <div className="divide-y divide-slate-700/50">
          {leaderboardData.length === 0 ? (
            <div className="p-8 text-center text-slate-500">No participants registered yet.</div>
          ) : (
            leaderboardData.map((user, index) => {
              const rank = index + 1;
              let styleStr = "bg-slate-800";
              let rankStyle = "text-slate-400 font-bold";
              
              if (rank === 1) { styleStr = "bg-yellow-500/10"; rankStyle = "text-yellow-400 font-black text-lg"; }
              else if (rank === 2) { styleStr = "bg-slate-300/10"; rankStyle = "text-slate-300 font-black text-lg"; }
              else if (rank === 3) { styleStr = "bg-amber-700/10"; rankStyle = "text-amber-500 font-black text-lg"; }

              return (
                <div key={user.profileId} className={`grid grid-cols-12 gap-2 p-3 items-center transition ${styleStr}`}>
                  <div className={`col-span-2 text-center ${rankStyle}`}>{rank === 1 ? '🥇' : rank === 2 ? '🥈' : rank === 3 ? '🥉' : `#${rank}`}</div>
                  <div className="col-span-6 text-left min-w-0">
                    <div className="font-bold text-white truncate text-sm" title={user.name}>{user.name}</div>
                    <div className="text-[10px] text-slate-400 truncate mt-0.5">
                      🏆 {user.champion1 || 'N/A'} - {user.champion2 || 'N/A'} - {user.champion3 || 'N/A'}
                    </div>
                  </div>
                  <div className="col-span-2 text-center flex flex-col items-center justify-center">
                    <span className="text-xs font-medium text-slate-300 bg-slate-900 px-2 py-0.5 rounded border border-slate-700">
                      <span className="text-emerald-400">{user.exact}</span>/<span className="text-blue-400">{user.outcome}</span>
                    </span>
                  </div>
                  <div className="col-span-2 text-center font-black text-emerald-400 text-lg">{user.points}</div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}

function AdminView({ isAdmin, setIsAdmin, matches, settings, passcode, usersData, predictions }) {
  const [inputCode, setInputCode] = useState('');
  const [actualChamp, setActualChamp] = useState(settings?.actualChampion || '');
  const [editingMatchId, setEditingMatchId] = useState(null);
  const [editForm, setEditForm] = useState({ teamA: '', teamB: '', date: '', time: '', group: '' });
  const [matchFilter, setMatchFilter] = useState('hide_completed');

  const exportToExcel = () => {
    const pastMatches = matches.filter(m => m.actualA !== null && m.actualA !== undefined && !isNaN(m.actualA));

    if (pastMatches.length === 0) {
      alert("There are no past matches to extract.");
      return;
    }

    const headers = ['Match No.', 'Match Stage', 'Match Date', 'Match Time', 'Team 1', 'Team 2', 'Score T1', 'Score T2'];
    
    usersData.forEach(user => {
      headers.push(`${user.name} (T1)`);
      headers.push(`${user.name} (T2)`);
      headers.push(`${user.name} (Pts)`);
    });

    const rows = [];
    pastMatches.forEach(match => {
      const row = [
        match.order,
        match.group,
        match.date,
        match.time,
        match.teamA,
        match.teamB,
        match.actualA,
        match.actualB
      ];

      usersData.forEach(user => {
        const pred = predictions.find(p => p.matchId === match.id && p.profileId === user.profileId);
        
        if (pred) {
          if (pred.isPk) {
            const winnerName = pred.pkWinner === 'A' ? match.teamA : match.teamB;
            row.push('PK', winnerName, (match.isPk && match.pkWinner === pred.pkWinner) ? 3 : ( (!match.isPk && ((parseInt(match.actualA) > parseInt(match.actualB) && pred.pkWinner === 'A') || (parseInt(match.actualB) > parseInt(match.actualA) && pred.pkWinner === 'B'))) ? 1 : 0 ));
          } else if (pred.scoreA !== '' && pred.scoreB !== '' && pred.scoreA !== undefined) {
            // User predicted with standard goals
            const pA = parseInt(pred.scoreA); const pB = parseInt(pred.scoreB);
            const aA = parseInt(match.actualA); const aB = parseInt(match.actualB);
            
            let points = 0;
            if (!match.isPk) {
              // Match ended with standard goals
              if (pA === aA && pB === aB) points = 3;
              else if ((pA > pB && aA > aB) || (pA < pB && aA < aB) || (pA === pB && aA === aB)) points = 1;
            } else {
              // Match ended in penalties, but user predicted standard goals
              const predWinner = pA > pB ? 'A' : (pA < pB ? 'B' : 'D');
              if (match.pkWinner === predWinner) points = 1;
            }

            row.push(pA, pB, points);
          } else {
            row.push('NA', 'NA', 0);
          }
        } else {
          row.push('NA', 'NA', 0);
        }
      });
      rows.push(row);
    });

    if (settings && settings.actualChampion) {
      const champRow = [
        '', 'World Cup 2026 Champion', '', '', '', '', settings.actualChampion, ''
      ];

      usersData.forEach(user => {
        let champPoints = 0;
        if (user.champion1 === settings.actualChampion) champPoints = 10;
        else if (user.champion2 === settings.actualChampion) champPoints = 7;
        else if (user.champion3 === settings.actualChampion) champPoints = 5;

        const userChoices = `${user.champion1} / ${user.champion2} / ${user.champion3}`;
        champRow.push(userChoices);  
        champRow.push('');           
        champRow.push(champPoints);  
      });

      rows.push(champRow);
    }

    const csvContent = '\uFEFF' + [headers, ...rows].map(e => e.join(',')).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.setAttribute('download', 'Past_Matches_Predictions.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleLogin = (e) => {
    e.preventDefault();
    if (inputCode === passcode) setIsAdmin(true);
    else alert("Incorrect passcode.");
  };

  const updateMatchSafely = async (matchId, updates) => {
    try {
      await setDoc(getBaseDoc('matches', matchId), updates, { merge: true });
    } catch (err) { console.error(err); alert("Failed to save changes."); }
  };

  const handleSetScores = (matchId, sA, sB) => {
    const cleanA = (sA === '' || sA === null || isNaN(parseInt(sA))) ? null : parseInt(sA);
    const cleanB = (sB === '' || sB === null || isNaN(parseInt(sB))) ? null : parseInt(sB);
    updateMatchSafely(matchId, { actualA: cleanA, actualB: cleanB });
  };

  const handleSetChampion = async () => {
    try { await setDoc(getBaseDoc('settings', 'global'), { actualChampion: actualChamp || null }, { merge: true }); }
    catch (err) { console.error(err); }
  };

  const handleToggleLock = (matchId, currentLock) => updateMatchSafely(matchId, { isLocked: !currentLock });

  const toggleRegistration = async () => {
    try {
      await setDoc(getBaseDoc('settings', 'global'), { isRegistrationLocked: !settings?.isRegistrationLocked }, { merge: true });
    } catch (err) { console.error(err); }
  };

  const handleDeleteUser = async (profileId) => {
    if (window.confirm("Are you sure you want to delete this user permanently along with their predictions?")) {
      try {
        await deleteDoc(getBaseDoc('users', profileId));
        const userPreds = predictions.filter(p => p.profileId === profileId);
        const batch = writeBatch(db);
        userPreds.forEach(p => { batch.delete(getBaseDoc('predictions', p.id)); });
        await batch.commit();
      } catch (err) { console.error(err); alert("Error deleting user."); }
    }
  };

  const openEditForm = (match) => {
    setEditingMatchId(match.id);
    setEditForm({ teamA: match.teamA, teamB: match.teamB, date: match.date, time: match.time, group: match.group });
  };

  const saveEditForm = async () => {
    await updateMatchSafely(editingMatchId, { ...editForm });
    setEditingMatchId(null);
  };

  if (!isAdmin) {
    return (
      <div className="max-w-sm mx-auto mt-10 bg-slate-800 p-6 rounded-2xl shadow-xl border border-slate-700 text-center">
        <Lock className="w-12 h-12 text-slate-500 mx-auto mb-4" />
        <h2 className="text-xl font-bold text-white mb-2">Admin Panel</h2>
        <p className="text-sm text-slate-400 mb-6">Enter the secret passcode to manage the app.</p>
        <form onSubmit={handleLogin}>
          <input type="password" value={inputCode} onChange={e => setInputCode(e.target.value)} className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-3 text-center text-xl tracking-widest text-white focus:ring-2 focus:ring-emerald-500 outline-none mb-4" placeholder="••••" />
          <button type="submit" className="w-full bg-slate-700 hover:bg-slate-600 text-white font-bold rounded-lg px-4 py-3 transition">Enter</button>
        </form>
      </div>
    );
  }

  const displayedMatches = matches.filter(match => {
    if (matchFilter === 'hide_completed') {
      const hasResult = match.isPk ? !!match.pkWinner : (match.actualA !== null && match.actualA !== undefined && !isNaN(match.actualA));
      return !(match.isLocked && hasResult);
    }
    return true; 
  });

  return (
    <div className="space-y-6 mb-20 text-left">
      <div className="flex items-center justify-between bg-slate-800 p-4 rounded-xl border border-slate-700">
        <h2 className="text-lg font-bold text-white flex items-center gap-2"><Settings className="w-5 h-5 text-emerald-400"/> Admin Dashboard</h2>
        <button onClick={() => setIsAdmin(false)} className="text-sm text-slate-400 hover:text-white bg-slate-900 px-3 py-1.5 rounded">Log Out</button>
      </div>

      <div className="bg-slate-800 p-4 rounded-xl border border-slate-700 shadow-md flex justify-between items-center">
        <div>
          <h3 className="font-bold text-white text-sm">New User Registration</h3>
          <p className="text-xs text-slate-400 mt-1">Lock or unlock new sign-ups.</p>
        </div>
        <button onClick={toggleRegistration} className={`px-4 py-2 rounded-lg font-bold text-sm transition-colors ${settings?.isRegistrationLocked ? 'bg-red-500/20 text-red-400 border border-red-500/30' : 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'}`}>
          {settings?.isRegistrationLocked ? 'Locked (Open Registration)' : 'Open (Lock Registration)'}
        </button>
      </div>

      <div className="bg-slate-800 p-4 rounded-xl border border-slate-700 shadow-md">
        <h3 className="font-bold text-white mb-3 text-sm">User Management</h3>
        <div className="space-y-2 max-h-48 overflow-y-auto pr-2">
          {usersData.map(u => (
            <div key={u.profileId} className="flex justify-between items-center bg-slate-900 p-2 rounded border border-slate-700">
              <div>
                <div className="text-sm font-bold text-white truncate">{u.name}</div>
                <div className="text-xs text-slate-400 font-mono">PIN: {u.pin}</div>
              </div>
              <button onClick={() => handleDeleteUser(u.profileId)} className="text-slate-500 hover:text-red-400 p-2 transition-colors">
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))}
          {usersData.length === 0 && <div className="text-xs text-slate-500 text-center">No players registered yet.</div>}
        </div>
      </div>

      <div className="bg-slate-800 p-4 rounded-xl border border-slate-700 shadow-md">
        <h3 className="font-bold text-white mb-3 text-sm">Set World Cup Champion (for bonus points)</h3>
        <div className="flex gap-2">
          <select value={actualChamp} onChange={(e) => setActualChamp(e.target.value)} className="flex-1 bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-white outline-none">
            <option value="">Not decided yet</option>
            {ALL_48_TEAMS.map(t => <option key={t} value={t}>{t}</option>)}
          </select>
          <button onClick={handleSetChampion} className="bg-emerald-500 text-slate-900 px-4 py-2 rounded-lg font-bold text-sm hover:bg-emerald-400">Save Champion</button>
        </div>
      </div>

      <div className="bg-slate-800 p-4 rounded-xl border border-slate-700 shadow-md flex justify-between items-center">
        <div>
          <h3 className="font-bold text-white text-sm">Export Predictions (CSV)</h3>
          <p className="text-xs text-slate-400 mt-1">Download past matches predictions & results.</p>
        </div>
        <button onClick={exportToExcel} className="flex items-center gap-2 bg-blue-500/20 text-blue-400 border border-blue-500/30 px-4 py-2 rounded-lg font-bold text-sm hover:bg-blue-500 hover:text-white transition-colors">
          <Download className="w-4 h-4" />
          Download
        </button>
      </div>

      <div className="bg-slate-800 p-4 rounded-xl border border-slate-700 shadow-md space-y-4">
        <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-3 border-b border-slate-700/50 pb-3">
          <div>
            <h3 className="font-bold text-white text-sm">Manage All 104 Matches</h3>
            <p className="text-xs text-slate-400 mt-1">Edit match details or input final scores.</p>
          </div>
          
          <div className="bg-slate-900 p-1 rounded-lg border border-slate-700 flex gap-1 self-start sm:self-auto w-full sm:w-auto">
            <button 
              onClick={() => setMatchFilter('show_all')} 
              className={`flex-1 text-center py-1.5 px-3 rounded text-[11px] font-bold transition-all duration-200 ${matchFilter === 'show_all' ? 'bg-emerald-500 text-slate-950 shadow-md' : 'text-slate-400 hover:text-white hover:bg-slate-800'}`}>
              Show All
            </button>
            <button 
              onClick={() => setMatchFilter('hide_completed')} 
              className={`flex-1 text-center py-1.5 px-3 rounded text-[11px] font-bold transition-all duration-200 ${matchFilter === 'hide_completed' ? 'bg-emerald-500 text-slate-950 shadow-md' : 'text-slate-400 hover:text-white hover:bg-slate-800'}`}>
              Hide Finished
            </button>
          </div>
        </div>
        
        <div className="space-y-3 max-h-[600px] overflow-y-auto pr-2">
          {displayedMatches.length === 0 ? (
            <div className="text-center py-6 text-slate-400 text-sm">No matches to display with the current filter.</div>
          ) : (
            displayedMatches.map(match => (
            <div key={match.id} className="bg-slate-900 p-3 rounded-lg border border-slate-700 flex flex-col gap-3">
              <div className="flex justify-between items-start">
                <div>
                  <div className="text-xs text-slate-400 font-mono mb-1">{match.date} • {match.time} • {match.group} (M{match.order})</div>
                  <div className="text-sm font-bold text-white truncate">{match.teamA} <span className="text-slate-500">VS</span> {match.teamB}</div>
                </div>
                <button onClick={() => openEditForm(match)} className="text-slate-400 hover:text-emerald-400 p-1 bg-slate-800 rounded transition-colors ml-2">
                  <Edit2 className="w-4 h-4" />
                </button>
              </div>

              {editingMatchId === match.id && (
                <div className="bg-slate-800 p-3 rounded border border-emerald-500/30 mt-2">
                  <div className="grid grid-cols-2 gap-2 mb-2">
                    <div><label className="text-xs text-slate-400">Team 1</label><input type="text" value={editForm.teamA} onChange={e => setEditForm({...editForm, teamA: e.target.value})} className="w-full bg-slate-900 border border-slate-700 rounded px-2 py-1 text-white text-sm" /></div>
                    <div><label className="text-xs text-slate-400">Team 2</label><input type="text" value={editForm.teamB} onChange={e => setEditForm({...editForm, teamB: e.target.value})} className="w-full bg-slate-900 border border-slate-700 rounded px-2 py-1 text-white text-sm" /></div>
                    <div><label className="text-xs text-slate-400">Date</label><input type="date" value={editForm.date} onChange={e => setEditForm({...editForm, date: e.target.value})} className="w-full bg-slate-900 border border-slate-700 rounded px-2 py-1 text-white text-sm" /></div>
                    <div><label className="text-xs text-slate-400">Time</label><input type="time" value={editForm.time} onChange={e => setEditForm({...editForm, time: e.target.value})} className="w-full bg-slate-900 border border-slate-700 rounded px-2 py-1 text-white text-sm" /></div>
                    <div className="col-span-2"><label className="text-xs text-slate-400">Match Stage</label><input type="text" value={editForm.group} onChange={e => setEditForm({...editForm, group: e.target.value})} className="w-full bg-slate-900 border border-slate-700 rounded px-2 py-1 text-white text-sm" /></div>
                  </div>
                  <div className="flex justify-end gap-2">
                    <button onClick={() => setEditingMatchId(null)} className="px-3 py-1.5 text-xs text-slate-400 bg-slate-900 rounded">Cancel</button>
                    <button onClick={saveEditForm} className="px-3 py-1.5 text-xs font-bold text-slate-900 bg-emerald-500 rounded">Save Edit</button>
                  </div>
                </div>
              )}
              
              {!editingMatchId && (
                <div className="flex flex-col gap-2 border-t border-slate-800 pt-2 mt-1">
                  
                  {!match.group.toLowerCase().includes('group') && (
                    <div className="flex items-center justify-between bg-slate-950/40 p-1.5 rounded border border-slate-800">
                      <button onClick={() => updateMatchSafely(match.id, { isPk: !match.isPk, actualA: null, actualB: null, pkWinner: null })} className={`text-[10px] px-2 py-1 rounded font-bold border transition-colors ${match.isPk ? 'bg-emerald-500 text-slate-950 border-emerald-400' : 'bg-slate-900 text-slate-400 border-slate-700'}`}>
                        {match.isPk ? '✓ Penalties active' : 'Convert to Penalties'}
                      </button>

                      {match.isPk && (
                        <div className="flex gap-1.5">
                          <button onClick={() => updateMatchSafely(match.id, { pkWinner: 'A' })} className={`text-[10px] px-2 py-0.5 rounded ${match.pkWinner === 'A' ? 'bg-emerald-500 text-slate-950 font-bold' : 'bg-slate-800 text-slate-400'}`}>{match.teamA} wins</button>
                          <button onClick={() => updateMatchSafely(match.id, { pkWinner: 'B' })} className={`text-[10px] px-2 py-0.5 rounded ${match.pkWinner === 'B' ? 'bg-emerald-500 text-slate-950 font-bold' : 'bg-slate-800 text-slate-400'}`}>{match.teamB} wins</button>
                        </div>
                      )}
                    </div>
                  )}

                  <div className="flex items-center justify-between">
                    {match.isPk ? (
                      <span className="text-xs font-bold text-emerald-400">Decided by Penalties</span>
                    ) : (
                      <div className="flex items-center gap-2">
                        <input type="number" placeholder="A" value={match.actualA ?? ''} onChange={(e) => handleSetScores(match.id, e.target.value, match.actualB)} className="w-12 h-9 bg-slate-800 border border-slate-600 rounded text-center font-bold text-white text-sm" />
                        <span className="text-slate-500">-</span>
                        <input type="number" placeholder="B" value={match.actualB ?? ''} onChange={(e) => handleSetScores(match.id, match.actualA, e.target.value)} className="w-12 h-9 bg-slate-800 border border-slate-600 rounded text-center font-bold text-white text-sm" />
                      </div>
                    )}

                    <button onClick={() => handleToggleLock(match.id, match.isLocked)} className={`text-xs px-2 py-1.5 rounded w-16 font-medium transition-colors ${match.isLocked ? 'bg-red-500/20 text-red-400 border border-red-500/30' : 'bg-slate-800 text-slate-400 border border-slate-600'}`}>
                      {match.isLocked ? 'Locked' : 'Open'}
                    </button>
                  </div>

                </div>
              )}
            </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

