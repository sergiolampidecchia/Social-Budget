import React from "react";

const FeedbackContext = React.createContext({
    setShouldRefresh: (value) => {}
});

export default FeedbackContext;