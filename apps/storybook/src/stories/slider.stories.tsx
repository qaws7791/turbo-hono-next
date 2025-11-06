import { Label } from "@repo/ui/form";
import {
  Slider,
  SliderFillTrack,
  SliderOutput,
  SliderThumb,
  SliderTrack,
} from "@repo/ui/slider";
import * as React from "react";

import type { Meta, StoryObj } from "@storybook/react";

/**
 * Slider component based on React Aria Components
 *
 * Features:
 * - Full keyboard navigation (Arrow keys to adjust, Home/End for min/max)
 * - ARIA attributes for accessibility
 * - Horizontal and vertical orientations
 * - Single and range (multiple thumbs) support
 * - Customizable min, max, and step values
 * - Smooth dragging interaction
 * - Accessible by default
 *
 * Common use cases:
 * - Volume controls
 * - Price range filters
 * - Brightness/opacity controls
 * - Progress indicators with control
 * - Settings adjustments
 *
 * @see https://react-spectrum.adobe.com/react-aria/Slider.html
 */
const meta = {
  title: "Components/Slider",
  component: Slider,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
  argTypes: {
    defaultValue: {
      control: { type: "range", min: 0, max: 100, step: 1 },
      description: "Default value",
    },
    minValue: {
      control: "number",
      description: "Minimum value",
      table: {
        defaultValue: { summary: "0" },
      },
    },
    maxValue: {
      control: "number",
      description: "Maximum value",
      table: {
        defaultValue: { summary: "100" },
      },
    },
    step: {
      control: "number",
      description: "Step increment",
      table: {
        defaultValue: { summary: "1" },
      },
    },
    isDisabled: {
      control: "boolean",
      description: "Whether the slider is disabled",
    },
  },
} satisfies Meta<typeof Slider>;

export default meta;
type Story = StoryObj<typeof meta>;

/**
 * Default slider
 */
export const Default: Story = {
  render: () => (
    <Slider
      defaultValue={50}
      className="w-[300px]"
    >
      <SliderTrack>
        <SliderFillTrack />
        <SliderThumb />
      </SliderTrack>
    </Slider>
  ),
};

/**
 * Slider with label and value display
 */
export const WithLabelAndValue: Story = {
  render: () => (
    <Slider
      defaultValue={65}
      className="w-[300px]"
    >
      <div className="flex w-full justify-between">
        <Label>Volume</Label>
        <SliderOutput />
      </div>
      <SliderTrack>
        <SliderFillTrack />
        <SliderThumb />
      </SliderTrack>
    </Slider>
  ),
};

/**
 * Different default values
 */
export const DifferentValues: Story = {
  render: () => (
    <div className="flex flex-col gap-6">
      <Slider
        defaultValue={0}
        className="w-[300px]"
      >
        <div className="flex w-full justify-between">
          <Label>0%</Label>
          <SliderOutput />
        </div>
        <SliderTrack>
          <SliderFillTrack />
          <SliderThumb />
        </SliderTrack>
      </Slider>
      <Slider
        defaultValue={50}
        className="w-[300px]"
      >
        <div className="flex w-full justify-between">
          <Label>50%</Label>
          <SliderOutput />
        </div>
        <SliderTrack>
          <SliderFillTrack />
          <SliderThumb />
        </SliderTrack>
      </Slider>
      <Slider
        defaultValue={100}
        className="w-[300px]"
      >
        <div className="flex w-full justify-between">
          <Label>100%</Label>
          <SliderOutput />
        </div>
        <SliderTrack>
          <SliderFillTrack />
          <SliderThumb />
        </SliderTrack>
      </Slider>
    </div>
  ),
};

/**
 * Custom range (0-10)
 */
export const CustomRange: Story = {
  render: () => (
    <Slider
      defaultValue={5}
      minValue={0}
      maxValue={10}
      className="w-[300px]"
    >
      <div className="flex w-full justify-between">
        <Label>Rating</Label>
        <SliderOutput />
      </div>
      <SliderTrack>
        <SliderFillTrack />
        <SliderThumb />
      </SliderTrack>
    </Slider>
  ),
};

/**
 * With step increment
 */
export const WithStep: Story = {
  render: () => (
    <Slider
      defaultValue={50}
      step={10}
      className="w-[300px]"
    >
      <div className="flex w-full justify-between">
        <Label>Step by 10</Label>
        <SliderOutput />
      </div>
      <SliderTrack>
        <SliderFillTrack />
        <SliderThumb />
      </SliderTrack>
    </Slider>
  ),
};

/**
 * Disabled slider
 */
export const Disabled: Story = {
  render: () => (
    <Slider
      defaultValue={50}
      isDisabled
      className="w-[300px]"
    >
      <div className="flex w-full justify-between">
        <Label>Disabled</Label>
        <SliderOutput />
      </div>
      <SliderTrack>
        <SliderFillTrack />
        <SliderThumb />
      </SliderTrack>
    </Slider>
  ),
};

/**
 * Controlled slider
 */
export const Controlled: Story = {
  render: () => {
    const [value, setValue] = React.useState(50);

    return (
      <div className="space-y-4">
        <Slider
          value={value}
          onChange={setValue}
          className="w-[300px]"
        >
          <div className="flex w-full justify-between">
            <Label>Controlled</Label>
            <SliderOutput />
          </div>
          <SliderTrack>
            <SliderFillTrack />
            <SliderThumb />
          </SliderTrack>
        </Slider>
        <div className="w-[300px] rounded-md bg-muted p-4">
          <p className="text-sm font-medium">Current value: {value}</p>
          <button
            onClick={() => setValue(75)}
            className="mt-2 h-8 rounded-md bg-primary px-3 text-sm text-primary-foreground"
          >
            Set to 75
          </button>
        </div>
      </div>
    );
  },
};

/**
 * Volume control example
 */
export const VolumeControl: Story = {
  render: () => {
    const [volume, setVolume] = React.useState(50);

    return (
      <div className="w-[350px] rounded-lg border p-6">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-lg font-semibold">Volume Control</h3>
          <span className="text-2xl">
            {volume === 0 ? "🔇" : volume < 50 ? "🔉" : "🔊"}
          </span>
        </div>
        <Slider
          value={volume}
          onChange={setVolume}
          className="w-full"
        >
          <div className="flex w-full justify-between">
            <Label>Volume</Label>
            <SliderOutput />
          </div>
          <SliderTrack>
            <SliderFillTrack />
            <SliderThumb />
          </SliderTrack>
        </Slider>
      </div>
    );
  },
};

/**
 * Brightness control
 */
export const BrightnessControl: Story = {
  render: () => {
    const [brightness, setBrightness] = React.useState(75);

    return (
      <div className="w-[350px] rounded-lg border p-6">
        <h3 className="mb-4 text-lg font-semibold">Display Settings</h3>
        <Slider
          value={brightness}
          onChange={setBrightness}
          className="w-full"
        >
          <div className="flex w-full justify-between">
            <Label>🔆 Brightness</Label>
            <SliderOutput />
          </div>
          <SliderTrack>
            <SliderFillTrack />
            <SliderThumb />
          </SliderTrack>
        </Slider>
        <div
          className="mt-4 h-24 rounded-md bg-gradient-to-r from-gray-900 to-white"
          style={{ opacity: brightness / 100 }}
        />
      </div>
    );
  },
};

/**
 * Price range filter
 */
export const PriceFilter: Story = {
  render: () => {
    const [price, setPrice] = React.useState(500);

    return (
      <div className="w-[350px] rounded-lg border p-6">
        <h3 className="mb-4 text-lg font-semibold">Filter Products</h3>
        <Slider
          value={price}
          onChange={setPrice}
          minValue={0}
          maxValue={1000}
          step={50}
          formatOptions={{ style: "currency", currency: "USD" }}
          className="w-full"
        >
          <div className="flex w-full justify-between">
            <Label>Maximum Price</Label>
            <SliderOutput />
          </div>
          <SliderTrack>
            <SliderFillTrack />
            <SliderThumb />
          </SliderTrack>
        </Slider>
        <p className="mt-4 text-sm text-muted-foreground">
          Showing products up to ${price}
        </p>
      </div>
    );
  },
};

/**
 * Settings panel with multiple sliders
 */
export const SettingsPanel: Story = {
  render: () => {
    const [settings, setSettings] = React.useState({
      volume: 70,
      brightness: 80,
      contrast: 50,
    });

    return (
      <div className="w-[400px] space-y-6 rounded-lg border p-6">
        <h3 className="text-lg font-semibold">Audio & Display</h3>
        <Slider
          value={settings.volume}
          onChange={(value) =>
            setSettings((prev) => ({ ...prev, volume: value }))
          }
          className="w-full"
        >
          <div className="flex w-full justify-between">
            <Label>Volume</Label>
            <SliderOutput />
          </div>
          <SliderTrack>
            <SliderFillTrack />
            <SliderThumb />
          </SliderTrack>
        </Slider>
        <Slider
          value={settings.brightness}
          onChange={(value) =>
            setSettings((prev) => ({ ...prev, brightness: value }))
          }
          className="w-full"
        >
          <div className="flex w-full justify-between">
            <Label>Brightness</Label>
            <SliderOutput />
          </div>
          <SliderTrack>
            <SliderFillTrack />
            <SliderThumb />
          </SliderTrack>
        </Slider>
        <Slider
          value={settings.contrast}
          onChange={(value) =>
            setSettings((prev) => ({ ...prev, contrast: value }))
          }
          className="w-full"
        >
          <div className="flex w-full justify-between">
            <Label>Contrast</Label>
            <SliderOutput />
          </div>
          <SliderTrack>
            <SliderFillTrack />
            <SliderThumb />
          </SliderTrack>
        </Slider>
      </div>
    );
  },
};

/**
 * Temperature control
 */
export const TemperatureControl: Story = {
  render: () => {
    const [temperature, setTemperature] = React.useState(72);

    return (
      <div className="w-[350px] rounded-lg border p-6">
        <h3 className="mb-4 text-lg font-semibold">Thermostat</h3>
        <Slider
          value={temperature}
          onChange={setTemperature}
          minValue={60}
          maxValue={85}
          className="w-full"
        >
          <div className="flex w-full justify-between">
            <Label>Temperature</Label>
            <SliderOutput>
              {({ state }) => `${state.getThumbValue(0)}°F`}
            </SliderOutput>
          </div>
          <SliderTrack>
            <SliderFillTrack />
            <SliderThumb />
          </SliderTrack>
        </Slider>
        <div className="mt-4 text-center">
          <p className="text-4xl font-bold">{temperature}°F</p>
          <p className="text-sm text-muted-foreground">
            {temperature < 68
              ? "Cool"
              : temperature < 75
                ? "Comfortable"
                : "Warm"}
          </p>
        </div>
      </div>
    );
  },
};

/**
 * Different sizes
 */
export const DifferentSizes: Story = {
  render: () => (
    <div className="flex flex-col gap-6">
      <Slider
        defaultValue={50}
        className="w-[200px]"
      >
        <Label>Small (200px)</Label>
        <SliderTrack>
          <SliderFillTrack />
          <SliderThumb />
        </SliderTrack>
      </Slider>
      <Slider
        defaultValue={50}
        className="w-[300px]"
      >
        <Label>Medium (300px)</Label>
        <SliderTrack>
          <SliderFillTrack />
          <SliderThumb />
        </SliderTrack>
      </Slider>
      <Slider
        defaultValue={50}
        className="w-[400px]"
      >
        <Label>Large (400px)</Label>
        <SliderTrack>
          <SliderFillTrack />
          <SliderThumb />
        </SliderTrack>
      </Slider>
    </div>
  ),
};
