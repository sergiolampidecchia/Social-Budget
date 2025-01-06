import { useState, useContext } from 'react';
import { Form, Button, Container, Row, Col } from 'react-bootstrap';
import API from '../../API';
import { useNavigate } from 'react-router-dom';
import FeedbackContext from "../contexts/FeedbackContext.js";
import CurrencyInput from 'react-currency-input-field';
import "../App.css";
import { BsPiggyBankFill } from 'react-icons/bs'; 

export default function BudgetForm(props) {
    const [budget, setBudget] = useState("");
    const [error, setError] = useState("");
    const navigate = useNavigate();
    const {setShouldRefresh} = useContext(FeedbackContext);

    const setErrorFromError  = (err) => {
        let message = '';
        if (err.message) message = err.message;
        else message = "Unknown Error";
        setError(message);
    }

    const handleSubmit = async (e) => {
        e.preventDefault();
        await API.setBudget(budget)
        .then(() => {
            setShouldRefresh(true);
            navigate('/proposalist');
        })
        .catch((err) => {
            console.log(err);
            setErrorFromError(err);
        })
    }

    const handleLogout = async (e) => {
        e.preventDefault();
        try {
            props.logout();
            navigate('/');
        } catch (err) {
            console.log(err);
        }
    }

    if(props.user.role === "Admin"){
        return (
            <Container>
                <Row className="headerRow">
                <BsPiggyBankFill size={40} className="me-2"/>
                    <h1>Budget Sociale</h1>
                    <Button variant='secondary' onClick={handleLogout}>Logout</Button>
                </Row>
                <Row className="formRow">
                    <Col>
                        <h2>Set Initial Budget</h2>
                        {error && (
                        <h2 className="error-message">{error}</h2>
                        )}
                        <Form onSubmit={handleSubmit}>
                            <Form.Group controlId="budget" className="mb-3">
                                <Form.Label>Budget </Form.Label>
                                <CurrencyInput
                                className="form-control"
                                placeholder='Initial budget in €'
                                decimalsLimit={2}
                                decimalSeparator=","
                                groupSeparator="."
                                prefix="€ "
                                value={budget}
                                onValueChange={(value, name) => setBudget(value)}
                                required
                            />
                            </Form.Group>
                            <Button className="mt-3" variant="primary" type="submit">
                                Submit
                            </Button>
                        </Form>
                    </Col>
                </Row>
            </Container>
        );
    }else{
        return(
            <Container>
                <Row className="headerRow">
                    <h1>Budget Sociale</h1>
                    <Button variant='secondary' onClick={handleLogout}>Logout</Button>
                </Row>
                <Row className="formRow">
                    <Col>
                        <h2>Admin has not set the initial budget yet. Come back another time!</h2>
                    </Col>
                </Row>
            </Container>
        )
    }
}
