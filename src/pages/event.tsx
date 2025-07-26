import { useState, useEffect, useRef } from 'react';
import { Button } from 'primereact/button';
import { Card } from 'primereact/card';
import { Divider } from 'primereact/divider';
import { Dialog } from 'primereact/dialog';
import { InputText } from 'primereact/inputtext';
import { InputNumber } from 'primereact/inputnumber';
import { Calendar } from 'primereact/calendar';
import { Toast } from 'primereact/toast';
import emailjs from '@emailjs/browser';



const targetDate = new Date('2025-08-30T19:00:00');

export default function EventPage() {
    const [showPopup, setShowPopup] = useState(false);
    const [showFinalConfirmation, setShowFinalConfirmation] = useState(false);
    const [errors, setErrors] = useState<Partial<{
        nic: string;
        name: string;
        contact: string;
        email: string;
    }>>({});


    const [refNumber, setRefNumber] = useState('');
    const [datetime, setDatetime] = useState(new Date());
    const [name, setName] = useState('');
    const [contact, setContact] = useState('');
    const [nic, setNIC] = useState('');
    const [email, setEmail] = useState('');
    const [, setCountdown] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });
    const toast = useRef<Toast>(null);


    const handleFinalBooking = async () => {
        const newErrors: typeof errors = {
            nic: undefined
        };

        if (!name.trim()) newErrors.name = 'Name is required';
        if (!/^\d{10}$/.test(contact)) newErrors.contact = 'Contact must be a 10-digit number';
        if (!/\S+@\S+\.\S+/.test(email)) newErrors.email = 'Valid email is required'

        if (Object.keys(newErrors).length > 0) {
            setErrors(newErrors);
            return;
        }

        try {
            const templateParams = {
                ref_number: refNumber,
                name: name,
                contact: contact,
                email: email,
                date: datetime.toLocaleString(),
                vip_tickets: tickets.VIP,
                general_tickets: tickets.GENERAL,
                earlybird_tickets: tickets.EARLYBIRD,
                total_price: totalPrice.toLocaleString() + ' LKR',
            };

            await emailjs.send(
                'service_klav3nr',
                'template_abmb1me',
                templateParams,
                'dhGmVpAlLONpEZzF2'
            );

            console.log('Booking confirmed and email sent:', { name, contact, email, tickets, nic });
            setShowPopup(false);
            setShowFinalConfirmation(false);
            resetForm();

            toast.current?.show({
                severity: 'success',
                summary: 'Booking Confirmed',
                detail: 'Your tickets have been successfully booked! A confirmation has been sent to your email.',
                life: 4000,
            });
        } catch (error) {
            console.error('Failed to send email:', error);

            toast.current?.show({
                severity: 'error',
                summary: 'Email Error',
                detail: 'There was an issue sending your confirmation email. Your booking is still confirmed.',
                life: 4000,
            });
        }
    };

    type TicketType = 'VIP' | 'GENERAL' | 'EARLYBIRD';
    const [tickets, setTickets] = useState<Record<TicketType, number>>({
        VIP: 0,
        GENERAL: 0,
        EARLYBIRD: 0,
    });

    const prices: Record<TicketType, number> = {
        VIP: 5000,
        GENERAL: 3000,
        EARLYBIRD: 2500,
    };

    const totalPrice =
        tickets.VIP * prices.VIP +
        tickets.GENERAL * prices.GENERAL +
        tickets.EARLYBIRD * prices.EARLYBIRD;

    useEffect(() => {
        if (showPopup) {
            setRefNumber(`REF-${Date.now().toString().slice(-6)}`);
            setDatetime(new Date());
        }
    }, [showPopup]);

    useEffect(() => {
        const interval = setInterval(() => {
            const now = new Date().getTime();
            const distance = targetDate.getTime() - now;

            if (distance <= 0) {
                clearInterval(interval);
                setCountdown({ days: 0, hours: 0, minutes: 0, seconds: 0 });
            } else {
                setCountdown({
                    days: Math.floor(distance / (1000 * 60 * 60 * 24)),
                    hours: Math.floor((distance / (1000 * 60 * 60)) % 24),
                    minutes: Math.floor((distance / (1000 * 60)) % 60),
                    seconds: Math.floor((distance / 1000) % 60),
                });
            }
        }, 1000);

        return () => clearInterval(interval);
    }, []);

    const resetForm = () => {
        setName('');
        setContact('');
        setEmail('');
        setTickets({ VIP: 0, GENERAL: 0, EARLYBIRD: 0 });
        setErrors({});
    };

    const footerContent = showFinalConfirmation ? (
        <div className="flex justify-content-end gap-2">
            <Button
                label="No, Go Back"
                icon="pi pi-times"
                className="p-button-danger"
                onClick={() => setShowFinalConfirmation(false)}
            />
            <Button
                label="Yes, Confirm Booking"
                icon="pi pi-check"
                className="p-button-success"
                onClick={handleFinalBooking}
            />
        </div>
    ) : (
        <div className="flex p-2 justify-content-between align-items-center w-full border-top-1 border-gray-200 ml-3 flex-wrap">
            <span className="font-bold text-lg mb-2 md:mb-0">Total: {totalPrice.toLocaleString()} LKR</span>
            <Button
                label="Confirm Booking"
                icon="pi pi-check"
                className="border-none text-white px-4 py-2"
                style={{ backgroundColor: '#f97316', borderRadius: '10px' }}
                onClick={() => {
                    const newErrors: typeof errors = {};

                    if (!name.trim()) newErrors.name = 'Name is required';

                    if (!/^\d{10}$/.test(contact)) newErrors.contact = 'Contact must be a 10-digit number';

                    if (!/\S+@\S+\.\S+/.test(email)) newErrors.email = 'Valid email is required';

                    const trimmedNIC = nic.trim().toUpperCase();
                    const isOldNIC = /^[0-9]{9}V$/.test(trimmedNIC);
                    const isNewNIC = /^[0-9]{12}$/.test(trimmedNIC);
                    if (!isOldNIC && !isNewNIC) {
                        newErrors.nic = 'NIC must be 9 digits + "V" or 12 digits';
                    }

                    if (Object.keys(newErrors).length > 0) {
                        setErrors(newErrors);
                    } else {
                        setShowFinalConfirmation(true);
                    }
                }}
                disabled={totalPrice === 0}
            />
        </div>
    );

    return (
        <div style={{ fontFamily: 'Arial, sans-serif' }}>
            <Toast ref={toast} position="top-right" />
            <div className="flex justify-content-center" style={{ width: '100%', backgroundColor: '#850106' }}>
                <img
                    src="images/bg.jpg"
                    alt="Event Banner"
                    style={{
                        width: '1100px',
                        height: '310px',
                        objectFit: 'unset',
                    }}
                />
            </div>
            <Divider />
            <div className="flex md:flex-row justify-content-between gap-5 ml-6 mr-6">
                <div>
                    <img
                        src="images/event-banner.jpg"
                        alt="Event Banner"
                        className='mt-4'
                        style={{
                            width: '300px',
                            height: '330px',
                            boxShadow: '0 4px 8px rgba(0,0,0,0.5)',
                            objectFit: 'cover',
                        }}
                    />
                </div>

                <div className="md:flex-1">
                    <h2 className="text-2xl font-bold mb-2 uppercase">Get Ready For
                        Unforgettable memories with “Nuwara Aale”
                    </h2>
                    <p className="mb-2 text-justify text-lg" style={{ lineHeight: '1.6' }}>
                        Spend a Magical Evening to Heal Your Soul
                        Come and experience the magic of “Nuwara Aale” at Sahas Uyana!
                    </p>
                    <strong>Chapter 01</strong>
                    <div className="flex align-items-center gap-2 mb-2 text-sm text-gray-800 flex-wrap mt-2">
                        <i className="pi pi-calendar text-orange-500" />
                        <span>August 30, 2025 | From 7:00 PM onwards</span>
                    </div>
                    <div className="flex align-items-center gap-2 mb-2 text-sm text-gray-800 flex-wrap">
                        <i className="pi pi-map-marker text-orange-500" />
                        <span>Sahas Uyana - Kandy</span>
                    </div>
                    <div className="flex align-items-center gap-2 text-sm text-gray-800 flex-wrap mb-4">
                        <i className="pi pi-users text-orange-500" />
                        <span>Organized by Ever Efficient Business Management</span>
                    </div>
                    <strong>For Tickets, Contact Now:</strong>
                    <div className="flex gap-2 text-black mt-2 mb-2">
                        <span>📞 Shamila – 077 4152525</span>
                        <span>📞 Sanduni – 076 0450456</span>
                    </div>
                    <span>📞 Dilrukshi – 071 033210</span>
                </div>

                <Card
                    className="md:w-4 sm:w-full shadow-3"
                    style={{
                        width: '300px',
                        height: '340px',
                        boxShadow: '0 4px 8px rgba(0,0,0,0.5)',
                        objectFit: 'cover',
                    }}
                >
                    <h3 className="mb-4 font-semibold">Ticket Prices</h3>
                    {[
                        { type: 'VIP', price: '5000.00 LKR' },
                        { type: 'GENERAL', price: '3000.00 LKR' },
                        { type: 'EARLY BIRD', price: '2500.00 LKR' },
                    ].map((ticket, i) => (
                        <div key={i} className="flex justify-content-between mb-3">
                            <span>{ticket.type}</span>
                            <span className="font-bold">{ticket.price}</span>
                        </div>
                    ))}
                    <Button
                        label="Book Now"
                        className="w-full mt-4 text-white font-bold"
                        style={{ backgroundColor: '#f97316', borderRadius: '10px' }}
                        onClick={() => setShowPopup(true)}
                    />
                </Card>
            </div>

            <Dialog
                header={
                    <div className="flex align-items-center gap-2">
                        <i className="pi pi-ticket text-orange-500 text-xl" />
                        <span className="text-xl font-bold text-gray-800">
                            {showFinalConfirmation ? 'Confirm Booking' : 'Buy Tickets'}
                        </span>
                    </div>
                }
                visible={showPopup}
                draggable={false}
                onHide={() => {
                    setShowPopup(false);
                    setShowFinalConfirmation(false);
                    resetForm();
                }}
                style={{ width: '90vw', maxWidth: '750px', borderRadius: '12px' }}
                footer={footerContent}
                className="p-fluid"
                blockScroll
            >
                {showFinalConfirmation ? (
                    <div className="text-center p-5">
                        <i className="pi pi-exclamation-triangle text-4xl text-orange-500 mb-3" />
                        <h5 className="text-xl font-semibold mb-2">Please Confirm Your Booking</h5>
                        <p className="text-gray-600">Are you sure you want to confirm your ticket booking?</p>
                    </div>
                ) : (
                    <div className="p-3" style={{ backgroundColor: '#fafafa', borderRadius: '8px', color: '#000000' }}>
                        <div className="field mb-3">
                            <label className="font-medium text-sm text-gray-700 mb-1">Reference Number</label>
                            <InputText value={refNumber} readOnly disabled className="w-full" />
                        </div>

                        <div className="field mb-3">
                            <label className="font-medium text-sm text-gray-700 mb-1">Time & Date</label>
                            <Calendar value={datetime} showTime disabled className="w-full" />
                        </div>

                        <div className="field mb-3">
                            <label className="font-medium text-sm text-gray-700 mb-1">Name</label>
                            <InputText
                                value={name}
                                onChange={(e) => {
                                    setName(e.target.value);
                                    setErrors((prev) => ({ ...prev, name: undefined }));
                                }}
                                placeholder="Your full name"
                                className={errors.name ? 'p-invalid' : ''}
                            />
                            {errors.name && <small className="p-error">{errors.name}</small>}
                        </div>

                        <div className="field mb-3">
                            <label className="font-medium text-sm text-gray-700 mb-1">NIC Number</label>
                            <InputText
                                value={nic}
                                onChange={(e) => {
                                    setNIC(e.target.value);
                                    setErrors((prev) => ({ ...prev, nic: undefined }));
                                }}
                                placeholder="9XXXXXXXV"
                                className={errors?.nic ? 'p-invalid' : ''}
                            />
                            {errors?.nic && <small className="p-error">{errors.nic}</small>}
                        </div>

                        <div className="field mb-3">
                            <label className="font-medium text-sm text-gray-700 mb-1">Contact Number</label>
                            <InputText
                                value={contact}
                                onChange={(e) => {
                                    setContact(e.target.value);
                                    setErrors((prev) => ({ ...prev, contact: undefined }));
                                }}
                                placeholder="07XXXXXXXX"
                                className={errors.contact ? 'p-invalid' : ''}
                            />
                            {errors.contact && <small className="p-error">{errors.contact}</small>}
                        </div>

                        <div className="field mb-4">
                            <label className="font-medium text-sm text-gray-700 mb-1">Email</label>
                            <InputText
                                value={email}
                                onChange={(e) => {
                                    setEmail(e.target.value);
                                    setErrors((prev) => ({ ...prev, email: undefined }));
                                }}
                                placeholder="your@email.com"
                                className={errors.email ? 'p-invalid' : ''}
                            />
                            {errors.email && <small className="p-error">{errors.email}</small>}
                        </div>

                        <div className="field mb-3" style={{ color: '#000000' }}>
                            <label className="font-medium text-sm mb-2">Select Ticket Quantities:</label>
                            <div className="flex flex-column gap-3">
                                {(['VIP', 'GENERAL', 'EARLYBIRD'] as TicketType[]).map((key) => (
                                    <div
                                        key={key}
                                        className="flex justify-content-between align-items-center px-4 py-3 border-round shadow-1"
                                        style={{
                                            minHeight: '50px',
                                            backgroundColor:
                                                key === 'GENERAL' ? '#cceeff' : key === 'EARLYBIRD' ? '#cd7f32' : '#EFBF04',
                                        }}
                                    >
                                        <span className="text-sm text-gray-800 font-medium">
                                            {key.charAt(0).toUpperCase() + key.slice(1)} ({prices[key].toLocaleString()} LKR)
                                        </span>
                                        <InputNumber
                                            value={tickets[key]}
                                            onValueChange={(e) => setTickets({ ...tickets, [key]: e.value || 0 })}
                                            showButtons
                                            min={0}
                                            max={10}
                                            inputStyle={{ width: '60px' }}
                                            className="w-4rem mr-5"
                                            buttonLayout="stacked"
                                            decrementButtonClassName="p-button"
                                            incrementButtonClassName="p-button"
                                        />
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                )}
            </Dialog>
        </div>
    );
}