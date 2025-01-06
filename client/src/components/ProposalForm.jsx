import { useEffect, useState } from 'react';
import { Form, Button, Container, Row, Col } from 'react-bootstrap';
import { useNavigate, useParams } from 'react-router-dom';
import CurrencyInput from 'react-currency-input-field';
import API from '../../API';
import "../App.css";
import { BsPiggyBankFill } from 'react-icons/bs'; 

export default function ProposalForm(props) {
    const [description, setDescription] = useState('');
    const [budget, setBudget] = useState(0);
    const [error, setError] = useState('')
    const [count, setCount] = useState(0)
    const navigate = useNavigate();

    const setErrorFromError  = (err) => {
        let message = '';
        if (err.message) message = err.message;
        else message = "Unknown Error";
        setError(message);
    }

    const handleSubmit = async (e) => {
        
        e.preventDefault();
        try{
            console.log(count);
            await API.createProposal(description, budget);
            alert("You have created a new proposal!");
            navigate('/proposalist')
        }catch(err){
            console.log(err)
            setErrorFromError(err)
        }
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
    
    const handleSubmitA = async (e) => {
        e.preventDefault();
        try{
            await API.changePhase();
        }catch (err){
            console.log(err);
        }
    }

    const handleSubmitB = async () => {
        try{
            navigate('/proposalist')
        }catch(err){
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
                    <Button variant='secondary' onClick={handleSubmitB}>Back</Button>
                    <Button variant='secondary' onClick={handleSubmitA}>Change phase</Button>
                </Row>
                <Row className="formRow">
                    <Col>
                        <h2>Submit a Proposal</h2>
                        {error && (
                        <h2 className="error-message">{error}</h2>
                    )}
                        <h4>Max budget is {props.budget}€</h4>
                        <Form onSubmit={handleSubmit}>
                            <Form.Group controlId='description' className="mb-3">
                                <Form.Label>Description </Form.Label>
                                <Form.Control placeholder="Proposal description" type="text" value={description} onChange={(e) => setDescription(e.target.value)} required={true} />
                            </Form.Group>
                            <Form.Group controlId='budget' className="mb-3">
                                <Form.Label>Budget </Form.Label>
                                <CurrencyInput
                                className="form-control"
                                placeholder='Proposal budget in €'
                                decimalsLimit={2}
                                decimalSeparator=","
                                groupSeparator="."
                                prefix="€ "
                                value={budget}
                                onValueChange={(value, name) => setBudget(value)}
                                required
                            />
                            </Form.Group>
                            <Button className="mt-3" variant='primary' type='submit'>Submit</Button>
                        </Form>
                    </Col>
                </Row>
            </Container>
        );
    }else{
        return (
            <Container>
                <Row className="headerRow">
                <BsPiggyBankFill size={40} className="me-2"/>
                    <h1>Budget Sociale</h1>
                    <Button variant='secondary' onClick={handleLogout}>Logout</Button>
                    <Button variant='secondary' onClick={handleSubmitB}>Back</Button>
                </Row>
                <Row className="formRow">
                    <Col>
                        <h2>Submit a Proposal</h2>
                        <h4>Max budget is {props.budget}€</h4>
                        {error && (
                        <h2 className="error-message">{error}</h2>
                    )}
                        <Form onSubmit={handleSubmit}>
                            <Form.Group controlId='description' className="mb-3">
                                <Form.Label>Description </Form.Label>
                                <Form.Control placeholder="Proposal description" type="text" value={description} onChange={(e) => setDescription(e.target.value)} required={true} />
                            </Form.Group>
                            <Form.Group controlId='budget' className="mb-3">
                                <Form.Label>Budget </Form.Label>
                                <CurrencyInput
                                className="form-control"
                                placeholder='Proposal budget in €'
                                decimalsLimit={2}
                                decimalSeparator=","
                                groupSeparator="."
                                prefix="€ "
                                value={budget}
                                onValueChange={(value, name) => setBudget(value)}
                                required
                            />
                            </Form.Group>
                            <Button className="mt-3" variant='primary' type='submit'>Submit</Button>
                        </Form>
                    </Col>
                </Row>
            </Container>
        );        
    }
}
