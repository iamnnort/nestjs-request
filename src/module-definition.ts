import { ConfigurableModuleBuilder } from '@nestjs/common';
import { BaseRequestConfig } from './types';

export const { ConfigurableModuleClass, MODULE_OPTIONS_TOKEN, OPTIONS_TYPE, ASYNC_OPTIONS_TYPE } =
  new ConfigurableModuleBuilder<BaseRequestConfig>().setClassMethodName('forRoot').build();
