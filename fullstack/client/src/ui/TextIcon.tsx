import React from "react";

interface TextIconProps {
  text: string;
  value: string;
}

const TextIcon: React.FC<TextIconProps> = ({ text, value }) => {
  const handleInsert = (e: React.MouseEvent | React.TouchEvent) => {
    e.preventDefault();
    const textToInsert = `{{${value}}}`;

    const activeElement = document.activeElement as
      | HTMLTextAreaElement
      | HTMLInputElement;
    if (
      activeElement &&
      (activeElement.tagName === "TEXTAREA" ||
        activeElement.tagName === "INPUT")
    ) {
      const start = activeElement.selectionStart || 0;
      const end = activeElement.selectionEnd || 0;
      const currentValue = activeElement.value;
      const newValue =
        currentValue.substring(0, start) +
        textToInsert +
        currentValue.substring(end);

      activeElement.value = newValue;
      activeElement.setSelectionRange(
        start + textToInsert.length,
        start + textToInsert.length
      );
      activeElement.focus();

      // Trigger onChange event manually
      const event = new Event("input", { bubbles: true });
      activeElement.dispatchEvent(event);
    }
  };

  return (
    <button
      className="inline-block bg-[#F25C54] text-white rounded px-2 py-1 text-sm font-semibold mr-2 mb-2 transition-colors hover:bg-[#D64641] active:bg-[#B93C37]"
      onClick={handleInsert}
      onTouchEnd={handleInsert}
    >
      {text}
    </button>
  );
};

export default TextIcon;
