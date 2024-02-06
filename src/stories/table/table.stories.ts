
import { Meta, moduleMetadata } from '@storybook/angular';
import { COMMON_MODULES, ExTemplateFactory, commonAppConfig } from '../utilities';

import { TableOverviewComponent } from './table-overview.component';

import { importProvidersFrom } from '@angular/core';

const meta: Meta<any> = {
  title: 'Angular/Table',
  argTypes: {
    preset: {
      control: { type: 'inline-radio' },
      options: [undefined, 'cx', 'px', 'rx'],
    },
  },
  decorators: [
    commonAppConfig({
      providers: [],
    }),
    moduleMetadata({
      imports: [
        ...COMMON_MODULES,
        TableOverviewComponent,
      ],
    }),
  ],
};
export default meta;

export const Overview = ExTemplateFactory('ex-table-overview').bind({});
