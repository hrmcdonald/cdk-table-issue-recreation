import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { RouterTestingModule } from '@angular/router/testing';
import { applicationConfig } from '@storybook/angular';
import { importProvidersFrom, InjectionToken } from '@angular/core';
import { ApplicationConfig } from '@angular/platform-browser';

export const ExTemplateFactory = (example: string) => {
  // We do more here to handle args passed into an iframe via query params for docs examples in production builds.
  // Just exposing the bare minimum for this recreation
  const template = (args: any) => `<div><${example}></${example}></div>`;
  return (args: any) => ({
    template: template(args),
  });
};

export const URL_ROOT = new InjectionToken<string>('URL_ROOT');

export const commonAppConfig: any = (config: ApplicationConfig) =>
  applicationConfig({
    providers: [
      importProvidersFrom(BrowserAnimationsModule),
      ...(config?.providers ?? []),
    ],
  });

export const COMMON_MODULES = [
  CommonModule,
  FormsModule,
  ReactiveFormsModule,
  RouterTestingModule,
];
