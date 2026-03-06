export default function SuggestionBar({ label, items, onSelect }) {
    if (!items || items.length === 0) return null;

    return (
        <div className="suggestion-bar">
            <strong>{label}</strong>
            {items.map((item, i) => (
                <span key={i} className="sugg-chip" onClick={() => onSelect(item)}>
                    {item}
                </span>
            ))}
        </div>
    );
}
