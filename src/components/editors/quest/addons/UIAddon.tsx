import { FormAddon } from '@/components/ui';
import { DebouncedTextarea } from '@/components/ui/DebouncedInput';

interface UIAddonProps {
    addon: any;
    onChange: (newAddon: any) => void;
}

export function UIAddon({ addon, onChange }: UIAddonProps) {
    return (
        <FormAddon
            label="界面 (UI)"
            description="任务显示文本列表"
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
                label="显示文本 (Display)"
                description="QuestEngine 格式：任务显示文本列表，每行一条，支持变量如 {progress_1}、{is_complete_1}"
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
