// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

contract CertificateRegistry {

    struct Certificate {
        string studentName;
        string course;
        string certificateHash;
        address issuer;
        uint256 timestamp;
        bool exists;
    }

    mapping(string => Certificate) private certificates;

    event CertificateIssued(
        string certificateId,
        string studentName,
        string course,
        string certificateHash,
        address issuer,
        uint256 timestamp
    );

    function issueCertificate(
        string memory certificateId,
        string memory studentName,
        string memory course,
        string memory certificateHash
    ) public {
        require(
            !certificates[certificateId].exists,
            "Certificate already exists"
        );

        certificates[certificateId] = Certificate({
            studentName: studentName,
            course: course,
            certificateHash: certificateHash,
            issuer: msg.sender,
            timestamp: block.timestamp,
            exists: true
        });

        emit CertificateIssued(
            certificateId,
            studentName,
            course,
            certificateHash,
            msg.sender,
            block.timestamp
        );
    }

    function verifyCertificate(
        string memory certificateId,
        string memory certificateHash
    ) public view returns (bool) {
        if (!certificates[certificateId].exists) {
            return false;
        }

        return keccak256(
            bytes(certificates[certificateId].certificateHash)
        ) == keccak256(
            bytes(certificateHash)
        );
    }

    function getCertificate(
        string memory certificateId
    )
        public
        view
        returns (
            string memory,
            string memory,
            string memory,
            address,
            uint256
        )
    {
        require(
            certificates[certificateId].exists,
            "Certificate not found"
        );

        Certificate memory cert = certificates[certificateId];

        return (
            cert.studentName,
            cert.course,
            cert.certificateHash,
            cert.issuer,
            cert.timestamp
        );
    }
}