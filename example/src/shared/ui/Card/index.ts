import { Card as CardRoot } from './Card';
import { CardHeader } from './CardHeader';
import { CardBody } from './CardBody';

export const Card = Object.assign(CardRoot, {
  Header: CardHeader,
  Body: CardBody,
});
