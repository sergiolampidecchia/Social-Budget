import React, { useState } from 'react';
import { Container, Row, Col, Form, Button } from 'react-bootstrap';
import { useNavigate } from "react-router-dom";
import "../App.css";
import { Link } from 'react-router-dom';
import { BsPiggyBankFill } from 'react-icons/bs'; 


export default function Login(props) {
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState('');
    const navigate = useNavigate();

    const setErrorFromError = (err) => {
        let message = '';
        if (err.message) message = err.message;
        else message = "Unknown Error";
        setError(message);
    }

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const user = await props.login(username, password);
            console.log(user);
            if (user) {
                if (props.phase === 0) {
                    navigate('/budgetform');
                } else if (props.phase === 1) {
                    navigate('/proposalist');
                } else if (props.phase === 2) {
                    navigate('/preferencesform');
                } else if (props.phase === 3) {
                    navigate('/anonymouspage');
                }
            }
        } catch (err) {
            console.log(err);
            setErrorFromError(err);
        }
    }

    const handleSubmitA = async (e) => {
        e.preventDefault();
        try {
            navigate('/anonymouspage');
        } catch (err) {
            console.log(err);
        }
    }

    return (
        <Container>
            <Row className="headerRow">
            <BsPiggyBankFill size={40} className="me-2"/>
                <h1>Budget Sociale</h1>
            </Row> 
            <Row className="formRow">
                <Col>
                    <h2 className='pb-3'>Login</h2>
                    {error && (
                        <h2 className="error-message">{error}</h2>
                    )}
                    <Form onSubmit={handleSubmit}>
                        <Form.Group className="mb-3" controlId="username">
                            <Form.Label>Username </Form.Label>
                            <Form.Control placeholder="Username" type="text" value={username} onChange={e => setUsername(e.target.value)} required={true} />
                        </Form.Group>
                        <Form.Group className="mb-3" controlId="password">
                            <Form.Label>Password </Form.Label>
                            <Form.Control placeholder="Password" type="password" value={password} onChange={e => setPassword(e.target.value)} required={true} />
                        </Form.Group>
                        <Button className="mt-3 login-button" variant="warning" type="submit">Login</Button>
                        <Link className="mt-3 anonymous-button" to="/anonymouspage">Continue as anonymous user</Link>
                    </Form>
                </Col>
            </Row>
        </Container>
    );
}


