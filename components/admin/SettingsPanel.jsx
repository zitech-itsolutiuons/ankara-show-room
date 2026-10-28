"use client";
import { Card, Field, Toggle, inputCls } from "@/components/admin/ui";

export default function SettingsPanel({ settings, product, onSettings, onProduct }) {
  const set = (patch) => onSettings({ ...settings, ...patch });
  return (
    <div className="mx-auto max-w-3xl space-y-5">
      <Card title="Hero scrolling" desc="Make the hero feel alive: as visitors scroll, the cloth changes while the hero stays in view.">
        <Toggle
          label="Scroll to change cloth"
          desc="The hero stays pinned on every screen size. Scroll to move through each colourway; visitors can also swipe the garment left or right."
          checked={settings.scrollChange}
          onChange={(v) => set({ scrollChange: v })}
        />
        <div className={`mt-6 border-t border-white/10 pt-5 transition-opacity ${settings.scrollChange ? "" : "pointer-events-none opacity-40"}`}>
          <Field label={`Scroll distance per cloth: ${settings.scrollStep}% of screen height`} hint="Lower feels snappier, higher gives each cloth more time on screen.">
            <input type="range" min={40} max={140} step={10} value={settings.scrollStep} onChange={(e) => set({ scrollStep: Number(e.target.value) })} className="w-full accent-white" />
          </Field>
          <div className="mt-5 grid gap-5 sm:grid-cols-2">
            <Field label="Cloth exit direction" hint="The outgoing cloth moves toward this corner as visitors scroll down. Scrolling up reverses the direction.">
              <select
                className={inputCls}
                value={settings.scrollExitCorner}
                onChange={(e) => set({ scrollExitCorner: e.target.value })}
              >
                <option value="top-left">Top left</option>
                <option value="top-right">Top right</option>
                <option value="bottom-left">Bottom left</option>
                <option value="bottom-right">Bottom right</option>
              </select>
            </Field>
            <Field
              label={`Transition distance: ${Math.round(Math.min(0.72, Math.max(0.18, settings.scrollTransitionDuration / 2)) * 100)}% of each scroll step`}
              hint="Choose how much of each colourway's scroll step the garment uses to sweep across the hero."
            >
              <input
                type="range"
                min={0.35}
                max={2}
                step={0.05}
                value={settings.scrollTransitionDuration}
                onChange={(e) => set({ scrollTransitionDuration: Number(e.target.value) })}
                className="w-full accent-white"
              />
            </Field>
          </div>
        </div>
      </Card>

      <Card title="Hero text">
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Headline, line 1">
            <input className={inputCls} maxLength={60} value={settings.headline1} onChange={(e) => set({ headline1: e.target.value })} />
          </Field>
          <Field label="Headline, line 2">
            <input className={inputCls} maxLength={60} value={settings.headline2} onChange={(e) => set({ headline2: e.target.value })} />
          </Field>
          <Field label="Description" className="sm:col-span-2" hint={`${settings.description.length}/300`}>
            <textarea className={inputCls} rows={3} maxLength={300} value={settings.description} onChange={(e) => set({ description: e.target.value })} />
          </Field>
        </div>
      </Card>

      <Card title="Brand and contact">
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Brand name">
            <input className={inputCls} maxLength={60} value={settings.brandName} onChange={(e) => set({ brandName: e.target.value })} />
          </Field>
          <Field label="Contact email">
            <input className={inputCls} type="email" value={settings.contactEmail} onChange={(e) => set({ contactEmail: e.target.value })} />
          </Field>
        </div>
      </Card>

      <Card title="Product">
        <Field label="Product name" hint="Shown in the checkout summary.">
          <input className={inputCls} maxLength={100} value={product.name} onChange={(e) => onProduct({ ...product, name: e.target.value })} />
        </Field>
      </Card>
    </div>
  );
}
