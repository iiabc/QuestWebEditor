import { Paper, Stack, PaperProps } from '@mantine/core';
import { ReactNode } from 'react';

interface FormSectionProps extends PaperProps {
    children: ReactNode;
    gap?: string | number;
}

export function FormSection({ children, gap = "sm", ...props }: FormSectionProps) {
    return (
        <Paper withBorder p="md" bg="var(--mantine-color-dark-7)" {...props}>
            <Stack gap={gap}>
                {children}
            </Stack>
        </Paper>
    );
}
