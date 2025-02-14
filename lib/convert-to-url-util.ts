export const convertToURL = (input: string, appendBaseUrl: boolean = false): string => {
    try {
        new URL(input);
        return input;
    } catch (error) {

        if (appendBaseUrl === true) {
            return `http://${process.env.BASE_URL}/${input}`;
        }
        return `http://${input}`;
    }
}