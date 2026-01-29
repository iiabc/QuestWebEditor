import { FormAddon } from '@/components/ui';
import { DebouncedTextarea } from '@/components/ui/DebouncedInput';

interface UIAddonProps {
    addon: any;
    onChange: (newAddon: any) => void;
}

export function UIAddon({ addon, onChange }: UIAddonProps) {
    return (
        <FormAddon
            label="界面"
            description="显示文本"
            checked={!!addon?.ui}
            onChange={(checked) => {
                if (checked) {
                    onChange({ ...addon, ui: { display: [] } });
                } else {
                    const { ui, ...rest } = addon || {};
                    onChange(rest);
                }
            }}
        >
            <DebouncedTextarea
                label="显示文本"
                description=""
                value={Array.isArray(addon?.ui?.display) ? addon.ui.display.join('\n') : ''}
                onChange={(val) => onChange({
                    ...addon,
                    ui: { display: val.split('\n').filter(line => line.trim().length > 0) }
                })}
                autosize
                minRows={3}
                debounceMs={800}
            />
        </FormAddon>
    );
}
