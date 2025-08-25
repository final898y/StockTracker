// Test setup file
import '@testing-library/jest-dom';
import React from 'react';

// Make React available globally for JSX
global.React = React;

// Mock ResizeObserver for tests
global.ResizeObserver = class ResizeObserver {
  constructor(callback: ResizeObserverCallback) {
    this.callback = callback;
  }
  
  private callback: ResizeObserverCallback;
  
  observe() {
    // Mock implementation
  }
  
  unobserve() {
    // Mock implementation
  }
  
  disconnect() {
    // Mock implementation
  }
};

// Import fake-indexeddb modules
import 'fake-indexeddb/auto';