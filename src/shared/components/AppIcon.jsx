import { getIconComponent } from '@utils/selectiveIcons';

function Icon({
    name,
    size = 24,
    color = "currentColor",
    className = "",
    strokeWidth = 2,
    ...props
}) {
    const IconComponent = getIconComponent(name);

    return <IconComponent
        size={size}
        color={color}
        strokeWidth={strokeWidth}
        className={className}
        {...props}
    />;
}
export default Icon;
