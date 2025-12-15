import {
  FontWeight,
  LogoSize,
  LogoPosition,
  Mood,
  DividerStyle,
} from './thumbnail.enums';

interface DropdownOption {
  name: string;
  value: string;
}

export const FONT_WEIGHT_OPTIONS: DropdownOption[] = [
  { name: 'Bold', value: FontWeight.BOLD },
  { name: 'Extra Bold', value: FontWeight.EXTRA_BOLD },
];

export const LOGO_SIZE_OPTIONS: DropdownOption[] = [
  { name: 'Small', value: LogoSize.SMALL },
  { name: 'Medium', value: LogoSize.MEDIUM },
  { name: 'Large', value: LogoSize.LARGE },
];

export const LOGO_POSITION_OPTIONS: DropdownOption[] = [
  { name: 'Top Left', value: LogoPosition.TOP_LEFT },
  { name: 'Top Right', value: LogoPosition.TOP_RIGHT },
  { name: 'Bottom Left', value: LogoPosition.BOTTOM_LEFT },
  { name: 'Bottom Right', value: LogoPosition.BOTTOM_RIGHT },
];

export const MOOD_OPTIONS: DropdownOption[] = [
  { name: 'Cinematic', value: Mood.CINEMATIC },
  { name: 'Serious', value: Mood.SERIOUS },
  { name: 'Dramatic', value: Mood.DRAMATIC },
];

export const DIVIDER_STYLE_OPTIONS: DropdownOption[] = [
  { name: 'Arrow', value: DividerStyle.ARROW },
  { name: 'Line', value: DividerStyle.LINE },
  { name: 'VS', value: DividerStyle.VS },
];

