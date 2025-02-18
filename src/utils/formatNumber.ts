export const formatNumber = (value: number | string | undefined) => {
    if (!value) return "0.00";
    return Number(value).toLocaleString('en-US', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
    });
};