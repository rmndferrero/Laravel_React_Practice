import { useState, useEffect, useRef } from 'react';
import { Head, Link, usePage } from '@inertiajs/react';
import AppLayout from '@/Layouts/AppLayout';
import axios from 'axios';

export default function ConversationShow({ conversation, messages: initialMessages, chatName }) {
    const { auth } = usePage().props;
    const [messages, setMessages] = useState(initialMessages);
    const [newMessage, setNewMessage] = useState('');
    const messagesEndRef = useRef(null);

    // Auto-scroll to the newest message
    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    // THE WEBSOCKET MAGIC: Listen for incoming messages
    useEffect(() => {
        const channel = window.Echo.private(`chat.${conversation.id}`)
            .listen('MessageSent', (e) => {
                // If someone else sent the message, add it to our screen!
                if (e.message.user_id !== auth.user.id) {
                    setMessages((prev) => [...prev, e.message]);
                }
            });

        return () => {
            window.Echo.leave(`chat.${conversation.id}`);
        };
    }, [conversation.id, auth.user.id]);

    const sendMessage = async (e) => {
        e.preventDefault();
        if (!newMessage.trim()) return;

        const tempMessage = newMessage;
        setNewMessage(''); // Clear input instantly for snappy UX

        try {
            const response = await axios.post(route('conversations.messages.store', conversation.id), {
                body: tempMessage
            });
            // Append our own message to the screen
            setMessages((prev) => [...prev, response.data]);
        } catch (error) {
            console.error("Failed to send message", error);
            setNewMessage(tempMessage); // Put text back if it failed
        }
    };

    return (
        <AppLayout currentPage="chat">
            <Head title={`Chat - ${chatName}`} />

            <div style={{ maxWidth: 800, margin: '0 auto', display: 'flex', flexDirection: 'column', height: 'calc(100vh - 120px)' }}>
                
                {/* Chat Header */}
                <div style={{ padding: 20, background: 'var(--surface)', border: '1px solid var(--border)', borderBottom: 'none', borderRadius: '8px 8px 0 0', display: 'flex', alignItems: 'center', gap: 16 }}>
                    <Link href={route('connections.index')} style={{ color: 'var(--text-muted)', textDecoration: 'none' }}>←</Link>
                    <div>
                        <h2 style={{ fontSize: 18, fontWeight: 600, color: 'var(--text)', margin: 0 }}>{chatName}</h2>
                        <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 11, color: 'var(--primary)', marginTop: 4 }}>
                            {conversation.is_group ? 'Group Channel' : 'Direct Message'}
                        </div>
                    </div>
                </div>

                {/* Messages Area */}
                <div style={{ flex: 1, background: 'var(--surface2)', border: '1px solid var(--border)', padding: 24, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 16 }}>
                    {messages.length === 0 ? (
                        <div style={{ margin: 'auto', color: 'var(--text-muted)', fontFamily: "'JetBrains Mono', monospace", fontSize: 12 }}>
                            No messages yet. Say hi!
                        </div>
                    ) : (
                        messages.map((msg, i) => {
                            const isMe = msg.user_id === auth.user.id;
                            return (
                                <div key={msg.id || i} style={{ alignSelf: isMe ? 'flex-end' : 'flex-start', maxWidth: '75%' }}>
                                    {!isMe && (
                                        <div style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 4, marginLeft: 12 }}>
                                            {msg.sender?.name}
                                        </div>
                                    )}
                                    <div style={{
                                        background: isMe ? 'var(--primary)' : 'var(--surface)',
                                        color: isMe ? '#fff' : 'var(--text)',
                                        border: isMe ? 'none' : '1px solid var(--border)',
                                        padding: '12px 16px',
                                        borderRadius: isMe ? '16px 16px 0 16px' : '16px 16px 16px 0',
                                        fontSize: 14,
                                        lineHeight: '1.5'
                                    }}>
                                        {msg.body}
                                    </div>
                                </div>
                            );
                        })
                    )}
                    <div ref={messagesEndRef} /> {/* Invisible div to scroll to */}
                </div>

                {/* Input Area */}
                <div style={{ padding: 20, background: 'var(--surface)', border: '1px solid var(--border)', borderTop: 'none', borderRadius: '0 0 8px 8px' }}>
                    <form onSubmit={sendMessage} style={{ display: 'flex', gap: 12 }}>
                        <input
                            type="text"
                            className="input"
                            placeholder="Type a message..."
                            value={newMessage}
                            onChange={(e) => setNewMessage(e.target.value)}
                            style={{ flex: 1, padding: '12px 16px' }}
                            autoComplete="off"
                        />
                        <button type="submit" disabled={!newMessage.trim()} className="btn btn-primary" style={{ padding: '0 24px', fontFamily: "'JetBrains Mono', monospace" }}>
                            SEND
                        </button>
                    </form>
                </div>

            </div>
        </AppLayout>
    );
}