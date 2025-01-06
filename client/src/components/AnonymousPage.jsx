import { useEffect, useState } from 'react';
import { Form, Button, Container, Row, Col, Table } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import API from '../../API';
import { BsPiggyBankFill } from 'react-icons/bs'; 

export default function AnonymousPage(props) {
    const [approvedProposals, setApprovedProposals] = useState([]);
    const [unapprovedProposals, setUnapprovedProposals] = useState([]);
    const [feedback, setFeedback] = useState('');
    const navigate = useNavigate();

    const setFeedbackFromError = (err) => {
        let message = '';
        if (err.message) message = err.message;
        else message = "Unknown Error";
        setFeedback(message);
    };

    useEffect(() => {
        if (props.phase === 3) {
            console.log("Fetching results");
            API.getAllPreferences()
            .then(preferences => {
                console.log("Preferences fetched:", preferences);
                setApprovedProposals(preferences.approvedProposals);
                setUnapprovedProposals(preferences.unapprovedProposals);
                console.log(unapprovedProposals)
            })
            .catch(e => {
                setFeedbackFromError(e);
            });
        }
    }, [props.phase]);

    const handleLogout = async (e) => {
        e.preventDefault();
        try {
            props.logout();
            navigate('/')
        } catch (err) {
            console.log(err);
        }
    }

    const handleReset = async (e) => {
        e.preventDefault();
        try {
            await API.reset();
            navigate('/budgetform');
        } catch (err) {
            console.log(err);
        }
    }
    
    if(props.phase !== 3){
        return(
            <Container>
                <Row className="headerRow">
                <BsPiggyBankFill size={40} className="me-2"/>
                    <h1>Budget Sociale</h1>
                    <Button variant='secondary' onClick={handleLogout}>Dashboard</Button>
                </Row>
                <Row className="formRow">
                    <Col>
                        <h2>There are no approved proposals yet</h2>
                    </Col>
                </Row>
            </Container>
        )
    }else if (!props.user || (!props.user.role === "Admin" && !props.user.role === "User")) {
        return (
            <Container>
                <Row className="headerRow">
                <BsPiggyBankFill size={40} className="me-2"/>
                    <h1>Budget Sociale</h1>
                    <Button variant='secondary' onClick={handleLogout}>Dashboard</Button>
                </Row>
                <Row className="formRow">
                    <Col>
                        <h2>Approved Proposals</h2>
                        <Table striped bordered hover>
                            <thead>
                                <tr>
                                    <th>Description</th>
                                    <th>User</th>
                                    <th>Budget</th>
                                    <th>Score</th>
                                </tr>
                            </thead>
                            <tbody>
                                {approvedProposals.map(proposal => (
                                    <tr key={proposal.id}>
                                        <td>{proposal.description}</td>
                                        <td>{proposal.userId}</td>
                                        <td>{proposal.budget}€</td>
                                        <td>{proposal.score}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </Table>
                    </Col>
                </Row>
            </Container>
        )
    } else {
        return (
            <Container>
                <Row className='headerRow'>
                <BsPiggyBankFill size={40} className="me-2"/>
                    <h1>Budget Sociale</h1>
                    <Button variant='secondary' onClick={handleLogout}>Logout</Button>
                    {props.user.role === "Admin" &&
                        <Button variant='secondary' onClick={handleReset}>Reset</Button>
                    }
                </Row>
                <Row className='resultRow'>
                    <Col>
                        <h2>Approved Proposals</h2>
                        <Table striped bordered hover>
                            <thead>
                                <tr>
                                    <th>Description</th>
                                    <th>User</th>
                                    <th>Budget</th>
                                    <th>Score</th>
                                </tr>
                            </thead>
                            <tbody>
                                {approvedProposals.map(proposal => (
                                    <tr key={proposal.id}>
                                        <td>{proposal.description}</td>
                                        <td>{proposal.userId}</td>
                                        <td>{proposal.budget}€</td>
                                        <td>{proposal.score}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </Table>
                    </Col>
                </Row>
                <Row className='resultRow'>
                    <Col>
                        <h2>Unapproved Proposals</h2>
                        <Table striped bordered hover>
                            <thead>
                                <tr>
                                    <th>Description</th>
                                    <th>Budget</th>
                                    <th>Score</th>
                                </tr>
                            </thead>
                            <tbody>
                                {unapprovedProposals.map(proposal => (
                                    <tr key={proposal.id}>
                                        <td>{proposal.description}</td>
                                        <td>{proposal.budget}€</td>
                                        <td>{proposal.score}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </Table>
                    </Col>
                </Row>
            </Container>
        )
    }
}
