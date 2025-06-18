import ReceivedRequestsTable from "@/app/home/request-tables/ReceivedRequestsTable";
import ReceivedInvitationsTable from "@/app/home/request-tables/ReceivedInvitationsTable";
import SentInvitationsTable from "@/app/home/request-tables/SentInvitationsTable";
import SentRequestsTable from "@/app/home/request-tables/SentRequestsTable";

export default function MyRequests() {
    return (
        <div>
            <h2 className="text-white text-xl font-semibold mb-4">
                Mis Solicitudes
            </h2>
            <div className="space-y-8">
                <ReceivedRequestsTable />
                <ReceivedInvitationsTable />
                <SentInvitationsTable />
                <SentRequestsTable />
            </div>
        </div>
    );
}
