import { Menu, Portal } from '@mantine/core';
import { useState } from 'react';

interface ContextMenuProps {
    children: React.ReactNode;
    menuItems: React.ReactNode;
}

export function ContextMenu({ children, menuItems }: ContextMenuProps) {
    const [opened, setOpened] = useState(false);
    const [position, setPosition] = useState({ x: 0, y: 0 });

    const handleContextMenu = (event: React.MouseEvent) => {
        event.preventDefault();
        event.stopPropagation();
        setPosition({ x: event.clientX, y: event.clientY });
        setOpened(true);
    };

    return (
        <div onContextMenu={handleContextMenu}>
            {children}
            {opened && (
                <Portal>
                    <Menu opened={true} onClose={() => setOpened(false)} shadow="md" width={200}>
                        <Menu.Target>
                            <div style={{ position: 'fixed', top: position.y, left: position.x, width: 0, height: 0 }} />
                        </Menu.Target>
                        <Menu.Dropdown>
                            {menuItems}
                        </Menu.Dropdown>
                    </Menu>
                </Portal>
            )}
        </div>
    );
}
