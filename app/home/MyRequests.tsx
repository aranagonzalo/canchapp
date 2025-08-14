import ReceivedRequestsTable from "@/app/home/request-tables/ReceivedRequestsTable";
import ReceivedInvitationsTable from "@/app/home/request-tables/ReceivedInvitationsTable";
import SentInvitationsTable from "@/app/home/request-tables/SentInvitationsTable";
import SentRequestsTable from "@/app/home/request-tables/SentRequestsTable";
import ReceivedRivalsTable from "./request-tables/ReceivedRivalsTable";
import SentRivalsTable from "./request-tables/SentRivalsTable";

export default function MyRequests() {
    return (
        <div>
            <div className="space-y-8">
                <p className="mb-2">Acciones realizadas por otros usuarios</p>
                <ReceivedRivalsTable />
                <ReceivedRequestsTable />
                <ReceivedInvitationsTable />

                <p className="mb-2">Acciones realizadas por vos</p>
                <SentRivalsTable />
                <SentInvitationsTable />
                <SentRequestsTable />
            </div>
        </div>
    );
}
