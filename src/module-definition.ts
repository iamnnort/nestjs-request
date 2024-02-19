import { ConfigurableModuleBuilder } from '@nestjs/common';
import { BaseRequestConfig } from './types';

export const { ConfigurableModuleClass, MODULE_OPTIONS_TOKEN } =
  new ConfigurableModuleBuilder<BaseRequestConfig>().build();
