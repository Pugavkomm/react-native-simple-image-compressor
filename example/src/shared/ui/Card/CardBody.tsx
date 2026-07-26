import type { FC } from 'react';
import { Stack, type StackProps } from '../Stack';

export const CardBody: FC<StackProps> = ({ ...props }) => {
  return <Stack paddingVertical={'medium'} {...props} />;
};
